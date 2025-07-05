// backend/controllers/authController.js
const User = require('../models/User'); // Assuming you have a User model defined here
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Needed for password hashing if not handled in model directly for initial setup

// Make sure your .env file has a JWT_SECRET defined
const SECRET = process.env.JWT_SECRET;

// --- Helper function to generate a JWT ---
const generateToken = (id, role) => {
  // Set token to expire in 30 minutes ('30m')
  return jwt.sign({ _id: id, role: role }, SECRET, { expiresIn: '30m' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body; // 'role' is NOT destructured from req.body as per PRD

    // --- Input Validation ---
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    if (password.length < 8) { // Basic password length check, enhance as needed
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    // Check if user already exists (email uniqueness)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' }); // 409 Conflict as per PRD for existing email
    }

    // As per PRD: "Only Admins can create new users or assign roles (for now)"
    // Self-registered users are always 'mentee'.
    const newUser = new User({
      fullName,
      email,
      password, // Password will be hashed by a pre-save hook in the User model (Bcrypt)
      role: 'mentee', // Hardcode role to 'mentee' for self-registration
      isProfileComplete: false // New users must complete profile after login
    });

    await newUser.save();

    // Optionally, automatically log in the user after registration and return a token
    // This aligns with the frontend's expectation to navigate to /Profile immediately.
    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        isProfileComplete: newUser.isProfileComplete,
      },
    });

  } catch (err) {
    console.error("❗ Registration error:", err);
    // Send a more generic server error message for unexpected issues
    res.status(500).json({ error: 'Server error during registration. Please try again later.' });
  }
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("📩 Login request:", { email });

  try {
    // Input validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.comparePassword(password))) {
      console.log("❌ Invalid credentials attempt for email:", email);
      // Use a generic "Invalid credentials" message to prevent username enumeration
      return res.status(401).json({ error: 'Invalid credentials.' }); // 401 Unauthorized as per PRD
    }

    // Generate JWT token with user id & role
    const token = generateToken(user._id, user.role);

    // Return token + user info as per PRD
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        // Assuming 'bio' is a key indicator for profile completion.
        // Adjust this logic if other fields are required for profile completion.
        isProfileComplete: !!user.bio,
      },
    });
  } catch (err) {
    console.error("❗ Server error during login:", err);
    res.status(500).json({ error: "Server error during login. Please try again later." });
  }
};

// @desc    Get currently authenticated user's details
// @route   GET /api/auth/me
// @access  Private (requires token)
exports.getMe = async (req, res) => {
  // The user information (including _id and role) is attached to req.user by authMiddleware
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'Not authorized, no user data in token.' });
  }

  try {
    // Fetch the user from the database using the ID from the token
    // Select specific fields for the response, exclude password hash
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
      id: user._id, // Use 'id' for frontend consistency (frontend looks for user.id or user._id)
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      bio: user.bio, // Include profile fields if already present
      skills: user.skills,
      goals: user.goals,
      isProfileComplete: !!user.bio, // Recalculate or retrieve from user document
      // Add other profile fields if needed (e.g., availability, experience)
    });
  } catch (err) {
    console.error('❗ Error fetching user details (getMe):', err);
    res.status(500).json({ error: 'Server error fetching user data.' });
  }
};


// @desc    Log out user (primarily client-side, but good to have a backend endpoint)
// @route   POST /api/auth/logout
// @access  Private (requires token)
exports.logoutUser = (req, res) => {
  // For JWTs, logout is mainly a client-side operation (removing the token).
  // If your system uses token blacklisting or server-side sessions, this is where you'd handle it.
  // For now, we'll just send a success message.
  res.status(200).json({ message: 'Logout successful.' });
};


// @desc    Save or update user profile
// @route   POST /api/auth/profile (Note: PRD suggests PUT /users/me/profile)
// @access  Private (requires token)
exports.saveUserProfile = async (req, res) => {
  // The user ID should come from the authenticated token, not from req.body.email
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'Not authorized, user ID missing from token.' });
  }
  const userId = req.user._id; // Get user ID from the authenticated request

  // Destructure profile fields from the request body
  const { fullName, bio, goals, skills, experience, availability } = req.body;

  try {
    // Create an object with fields to update
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (bio) updateFields.bio = bio;
    if (goals) updateFields.goals = goals; // Assuming goals is an array or string
    if (skills) updateFields.skills = skills; // Assuming skills is an array or string
    if (experience) updateFields.experience = experience; // Mentor-specific
    if (availability) updateFields.availability = availability; // Mentor-specific

    // Determine if profile is complete based on required fields.
    // As per PRD, "After signing in, all users must fill out a profile form"
    // We'll consider the profile complete if 'bio' is provided.
    if (bio) {
        updateFields.isProfileComplete = true;
    } else {
        updateFields.isProfileComplete = false; // Reset if bio is removed or not provided
    }

    // Find the user by ID from the token and update their profile
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators: true` runs schema validators
    ).select('-password'); // Exclude password from the returned user object

    if (!user) {
      return res.status(404).json({ error: 'User not found for profile update.' });
    }

    res.status(200).json({ message: 'Profile updated successfully!', user });

  } catch (err) {
    console.error("❗ Profile update error:", err);
    // Handle validation errors or other specific errors here if needed
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error updating profile. Please try again later.' });
  }
};

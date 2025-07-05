// backend/controllers/mentorController.js
const User = require("../models/User"); // Assuming your User model is here
const Session = require("../models/Session"); // Assuming you have a Session model defined

// @desc    Get all users with the role of 'mentor'
// @route   GET /api/mentors
// @access  Private (accessible to authenticated users, especially mentees for discovery)
// PRD: "Mentees can view a list of mentors with filters" implies authentication is needed
exports.getAllMentors = async (req, res) => {
  try {
    // Ensure only 'mentor' roles are fetched and sensitive info like password is excluded
    // You might also want to select specific public profile fields here
    const mentors = await User.find({ role: "mentor" }).select(
      "-password -availability -__v" // Exclude password and other potentially sensitive/unnecessary fields
    );

    // If no mentors are found, return an empty array rather than an error
    if (!mentors || mentors.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(mentors);
  } catch (err) {
    console.error("❗ Failed to fetch mentors:", err);
    res.status(500).json({ error: "Server error. Failed to fetch mentors." });
  }
};

// @desc    Get a single mentor's profile by ID
// @route   GET /api/mentors/:id
// @access  Private (accessible to authenticated users, especially mentees)
exports.getMentorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the user by ID and ensure they are a mentor
    // Select all relevant profile fields including availability, but exclude password
    const mentor = await User.findById(id).select("-password -__v");

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: "Mentor not found or is not a mentor." });
    }

    res.status(200).json(mentor);
  } catch (err) {
    console.error("❗ Failed to fetch mentor profile:", err);
    res.status(500).json({ error: "Server error. Failed to fetch mentor profile." });
  }
};

// @desc    Get the authenticated mentor's own availability
// @route   GET /api/mentors/availability
// @access  Private (mentor-only)
exports.getMentorAvailability = async (req, res) => {
  // Ensure the user is authenticated and is a mentor
  if (!req.user || req.user.role !== 'mentor' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentors can view their own availability.' });
  }

  try {
    const mentor = await User.findById(req.user._id).select('availability');

    if (!mentor) {
      return res.status(404).json({ error: "Mentor profile not found." });
    }

    res.status(200).json({ availability: mentor.availability || [] });
  } catch (err) {
    console.error("❗ Failed to fetch mentor's own availability:", err);
    res.status(500).json({ error: "Server error. Failed to fetch mentor's availability." });
  }
};


// @desc    Save or update a mentor's availability blocks
// @route   PUT /api/mentors/availability (as per PRD implied "Mentors set weekly availability blocks")
// @access  Private (mentor-only)
// This endpoint expects `req.user` to be populated by `authMiddleware.verifyToken`
exports.saveAvailability = async (req, res) => {
  // Ensure the user is authenticated and is a mentor
  if (!req.user || req.user.role !== 'mentor' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentors can set availability.' });
  }

  // The mentor's ID comes from the authenticated token, not the request body
  const mentorId = req.user._id;
  const { availability } = req.body; // Expecting 'availability' to be the data to save

  // --- Input Validation for Availability ---
  if (!availability) {
    return res.status(400).json({ error: "Availability data is required." });
  }
  // You might add more specific validation here for the structure of 'availability',
  // e.g., checking if it's an array of valid time slots.

  try {
    // Find the user by their ID from the token and update their availability
    const user = await User.findByIdAndUpdate(
      mentorId,
      { $set: { availability: availability } }, // Update the 'availability' field
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select('-password'); // Exclude password from the returned user object

    if (!user) {
      // This case should ideally not happen if req.user._id is valid, but good for robustness
      return res.status(404).json({ error: "Mentor not found." });
    }

    res.status(200).json({ message: "Availability updated successfully!", user });
  } catch (err) {
    console.error("❗ Failed to update availability:", err);
    // Handle potential validation errors from Mongoose schema if 'availability' structure is enforced
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error. Failed to update availability." });
  }
};

// @desc    Get all sessions for the authenticated mentor
// @route   GET /api/sessions/mentor
// @access  Private (mentor-only)
// PRD: "Mentors view upcoming and past mentorship sessions"
exports.getMentorSessions = async (req, res) => {
  // Ensure the user is authenticated and is a mentor
  if (!req.user || req.user.role !== 'mentor' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentors can view their sessions.' });
  }

  const mentorId = req.user._id; // Get mentor's ID from the authenticated token

  try {
    // Find sessions where the current user is the mentor
    // Populate mentee details to display in the frontend table
    const sessions = await Session.find({ mentor: mentorId })
      .populate('mentee', 'fullName email') // Populate mentee's full name and email
      .select('-__v'); // Exclude Mongoose version key

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({ message: "No sessions found for this mentor.", sessions: [] });
    }

    res.status(200).json({ message: "Sessions fetched successfully!", sessions });
  } catch (err) {
    console.error("❗ Failed to fetch mentor sessions:", err);
    res.status(500).json({ error: "Server error. Failed to fetch mentor sessions." });
  }
};

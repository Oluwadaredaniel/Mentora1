// backend/controllers/adminController.js
const User = require("../models/User"); // Ensure this path is correct
const bcrypt = require("bcryptjs"); // For hashing passwords
const jwt = require("jsonwebtoken"); // For token generation if needed, though not directly used for creation/role update by admin here
const Request = require("../models/Request"); // Corrected: Using Request model instead of MentorshipRequest
const Session = require("../models/Session"); // Import Session model

// @desc    Admin creates a new user (Admin, Mentor, or Mentee)
// @route   POST /api/admin/users
// @access  Private (Admin only)
exports.createUserByAdmin = async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Basic validation
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ error: "Please enter all required fields: full name, email, password, and role." });
  }

  if (!["admin", "mentor", "mentee"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified. Role must be 'admin', 'mentor', or 'mentee'." });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User with that email already exists." });
    }

    // IMPORTANT FIX: Do NOT hash password here.
    // The User model's pre('save') hook will handle hashing the password.
    // Passing the plain 'password' directly to the User constructor.
    user = new User({
      fullName,
      email,
      password: password, // Pass plain password; it will be hashed by the User model's pre-save hook
      role,
      isProfileComplete: false, // New users usually need to complete their profile
      skills: [], // Initializing skills and goals as empty arrays as per PRD
      goals: [],
      availability: [], // For mentors, availability will be set via their profile edit page
    });

    await user.save(); // The pre('save') hook in User.js will hash the password here.

    res.status(201).json({
      message: "User created successfully by admin.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating user by admin:", error);
    res.status(500).json({ error: "Server error during user creation." });
  }
};

// @desc    Admin: Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // New role to assign

  // Basic validation
  if (!role) {
    return res.status(400).json({ error: "Role is required." });
  }
  if (!["admin", "mentor", "mentee"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified. Role must be 'admin', 'mentor', or 'mentee'." });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Prevent an admin from changing their own role (optional, but good practice)
    // if (req.user.id === id && role !== 'admin') {
    //   return res.status(403).json({ error: "Admins cannot demote themselves." });
    // }

    user.role = role;
    await user.save();

    res.json({
      message: `User ${user.email} role updated to ${role}.`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Server error during role update." });
  }
};

// @desc    Admin: Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // OPTIONAL: Prevent an admin from deleting themselves
    // if (req.user.id === id) {
    //   return res.status(403).json({ error: "Admins cannot delete their own account." });
    // }

    // IMPORTANT: Implement cascading deletes for related data (requests, sessions)
    // Delete all sessions where the user was either the mentee or the mentor
    await Session.deleteMany({ $or: [{ mentee: id }, { mentor: id }] });
    // Delete all requests where the user was either the mentee or the mentor
    await Request.deleteMany({ $or: [{ mentee: id }, { mentor: id }] });


    await user.deleteOne(); // Use deleteOne() or deleteMany() for Mongoose 6+

    res.json({ message: `User ${user.email} and associated sessions/requests deleted successfully.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error during user deletion." });
  }
};


// @desc    Admin: List all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // Exclude passwords from the result
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Server error during fetching users." });
  }
};

// @desc    Admin: View all mentorship matches (accepted requests)
// @route   GET /api/admin/matches
// @access  Private (Admin only)
exports.getAllMatches = async (req, res) => {
  try {
    // A 'match' is an accepted mentorship request.
    const matches = await Request.find({ status: "ACCEPTED" }) // Using Request model
      .populate("mentee", "fullName email") // Populate mentee details
      .populate("mentor", "fullName email"); // Populate mentor details

    res.json(matches);
  } catch (error) {
    console.error("Error fetching all matches:", error);
    res.status(500).json({ error: "Server error during fetching matches." });
  }
};

// @desc    Admin: See the number of sessions held (and potentially list them)
// @route   GET /api/admin/sessions
// @access  Private (Admin only)
exports.getAllSessionsAdmin = async (req, res) => {
  try {
    // Populate mentee and mentor details for the sessions
    const sessions = await Session.find({})
      .populate("mentee", "fullName email") // Populate mentee's full name and email
      .populate("mentor", "fullName email"); // Populate mentor's full name and email

    // Map the sessions to include mentorName and menteeName directly for frontend consumption
    const formattedSessions = sessions.map(session => ({
      ...session.toObject(), // Convert Mongoose document to plain JavaScript object
      mentorName: session.mentor ? session.mentor.fullName : 'N/A',
      menteeName: session.mentee ? session.mentee.fullName : 'N/A',
      // Ensure feedback fields are included as per frontend interface
      feedbackFromMentee: session.menteeFeedback,
      feedbackFromMentor: session.mentorFeedback,
      rating: session.menteeRating,
    }));


    res.status(200).json({
      totalSessions: formattedSessions.length,
      sessions: formattedSessions,
    });
  } catch (error) {
    console.error("Error fetching all sessions for admin:", error);
    res.status(500).json({ error: "Server error during fetching sessions." });
  }
};

// @desc    Admin: Manually assign mentors to mentees (Create a new accepted request)
// @route   POST /api/admin/matches
// @access  Private (Admin only)
exports.createMatch = async (req, res) => {
  const { menteeId, mentorId, message } = req.body;

  if (!menteeId || !mentorId) {
    return res.status(400).json({ error: "Mentee ID and Mentor ID are required." });
  }

  try {
    // Check if both mentee and mentor exist and have the correct roles
    const mentee = await User.findById(menteeId);
    const mentor = await User.findById(mentorId);

    if (!mentee || mentee.role !== "mentee") {
      return res.status(404).json({ error: "Mentee not found or is not a mentee role." });
    }
    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ error: "Mentor not found or is not a mentor role." });
    }

    // Check if an accepted request already exists between them
    const existingMatch = await Request.findOne({ // Using Request model
      mentee: menteeId,
      mentor: mentorId,
      status: "ACCEPTED",
    });

    if (existingMatch) {
      return res.status(400).json({ error: "An active mentorship match already exists between these users." });
    }

    // Create a new mentorship request and set its status to ACCEPTED directly
    const newMatch = new Request({ // Using Request model
      mentee: menteeId,
      mentor: mentorId,
      message: message || "Admin assigned match.", // Optional message
      status: "ACCEPTED", // Directly set to accepted
      requestDate: new Date(),
    });

    await newMatch.save();

    res.status(201).json({
      message: "Mentorship match created successfully by admin.",
      match: newMatch,
    });
  } catch (error) {
    console.error("Error creating match by admin:", error);
    res.status(500).json({ error: "Server error during match creation." });
  }
};

// @desc    Admin: Clear all session history
// @route   DELETE /api/admin/sessions/clear
// @access  Private (Admin only)
exports.clearAllSessionsAdmin = async (req, res) => {
  try {
    await Session.deleteMany({}); // Delete all documents in the Session collection
    res.status(200).json({ message: "All session history cleared successfully." });
  } catch (error) {
    console.error("Error clearing all sessions for admin:", error);
    res.status(500).json({ error: "Server error during clearing sessions." });
  }
};

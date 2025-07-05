// backend/routes/mentorroutes.js
const express = require("express");
const router = express.Router();

// Import controller functions for mentor-related logic
const { saveAvailability, getAllMentors, getMentorProfile, getMentorAvailability } = require("../controllers/mentorController");

// Import authentication and role-based middleware
const { verifyToken, isMentor } = require("../middleware/authMiddleware");

// @route   GET /api/mentors/availability
// @desc    Fetch the authenticated mentor's own availability
// @access  Private (mentor-only)
// IMPORTANT: This route must be placed BEFORE /api/mentors/:id
router.get("/availability", verifyToken, isMentor, getMentorAvailability);

// @route   GET /api/mentors
// @desc    Fetch all mentors (for mentees to browse)
// @access  Private (accessible to any authenticated user)
router.get("/", verifyToken, getAllMentors);

// @route   GET /api/mentors/:id
// @desc    Fetch a single mentor's profile by ID (including availability)
// @access  Private (accessible to any authenticated user)
router.get("/:id", verifyToken, getMentorProfile);

// @route   PUT /api/mentors/availability
// @desc    Save or update a mentor's availability blocks
// @access  Private (mentor-only)
router.put("/availability", verifyToken, isMentor, saveAvailability);

module.exports = router;

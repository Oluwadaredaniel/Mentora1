// backend/routes/adminroutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware"); // Ensure you have isAdmin middleware

// All routes here will use the verifyToken and isAdmin middleware
// router.use(verifyToken); // This assumes a global verifyToken on '/api/admin' in app.js
// If not, add verifyToken to each route below like router.post("/", verifyToken, isAdmin, ...)

// @route   POST /api/admin/users
// @desc    Admin creates a new user (Admin, Mentor, or Mentee)
// @access  Private (Admin only)
router.post("/users", verifyToken, isAdmin, adminController.createUserByAdmin);

// @route   GET /api/admin/users
// @desc    Admin: List all users
// @access  Private (Admin only)
router.get("/users", verifyToken, isAdmin, adminController.getAllUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Admin: Update user role
// @access  Private (Admin only)
router.put("/users/:id/role", verifyToken, isAdmin, adminController.updateUserRole);

// @route   DELETE /api/admin/users/:id
// @desc    Admin: Delete a user
// @access  Private (Admin only)
router.delete("/users/:id", verifyToken, isAdmin, adminController.deleteUser);


// @route   GET /api/admin/matches
// @desc    Admin: View all mentorship matches (accepted requests)
// @access  Private (Admin only)
router.get("/matches", verifyToken, isAdmin, adminController.getAllMatches);

// @route   POST /api/admin/matches
// @desc    Admin: Manually assign mentors to mentees (Create a new accepted request)
// @access  Private (Admin only)
router.post("/matches", verifyToken, isAdmin, adminController.createMatch);


// @route   GET /api/admin/sessions
// @desc    Admin: See the number of sessions held (and potentially list them)
// @access  Private (Admin only)
router.get("/sessions", verifyToken, isAdmin, adminController.getAllSessionsAdmin);

// @route   DELETE /api/admin/sessions/clear
// @desc    Admin: Clear all session history
// @access  Private (Admin only)
router.delete("/sessions/clear", verifyToken, isAdmin, adminController.clearAllSessionsAdmin);

module.exports = router;

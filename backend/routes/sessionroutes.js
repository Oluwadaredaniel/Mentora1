// backend/routes/sessionroutes.js
const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController"); // Import session controller functions

// Import authentication and role-based middleware from your authMiddleware file
const { verifyToken, isMentor, isMentee, isAdmin } = require("../middleware/authMiddleware"); // Added isAdmin for clarity

// All routes in this router are mounted under '/api/sessions' in app.js
// and are already protected by 'verifyToken' there.
// We explicitly add 'isMentor' or 'isMentee' middleware where role-specific access is required,
// even if the controller also performs role checks, for clear route-level authorization.

// @route   POST /api/sessions
// @desc    Create a new mentorship session
// @access  Private (Mentee or Admin only for booking)
// PRD: "Mentees choose a slot and book a session"
// Changed middleware to allow 'isMentee' or 'isAdmin'
router.post("/", verifyToken, (req, res, next) => {
  // Allow both mentee and admin to create sessions via this route
  if (req.user && (req.user.role === 'mentee' || req.user.role === 'admin')) {
    next(); // Proceed if mentee or admin
  } else {
    return res.status(403).json({ error: 'Access denied. Only mentees or admins can book/create sessions.' });
  }
}, sessionController.createSession);


// @route   GET /api/sessions/mentor
// @desc    Get all sessions for the authenticated mentor
// @access  Private (Mentor only)
// PRD: "Mentors view upcoming and past mentorship sessions"
router.get("/mentor", verifyToken, isMentor, sessionController.getMentorSessions); // Corrected to getMentorSessions

// @route   GET /api/sessions/mentee
// @desc    Get all sessions for the authenticated mentee
// @access  Private (Mentee only)
// PRD: "Mentees view upcoming and past mentorship sessions"
router.get("/mentee", verifyToken, isMentee, sessionController.getMenteeSessions); // Corrected to getMenteeSessions

// @route   PUT /api/sessions/:id/feedback
// @desc    Submit feedback/rating for a session (by mentee or mentor)
// @access  Private (Mentee or Mentor)
// PRD: "After a session, the mentee is asked to rate it (1–5 stars) and leave a comment."
// PRD: "Mentors can also leave optional comments about the session."
// No specific role middleware here, as the controller handles which role can submit which type of feedback.
router.put("/:id/feedback", verifyToken, sessionController.submitFeedback);

// @route   PUT /api/sessions/:id/complete
// @desc    Mentor marks a session as completed
// @access  Private (Mentor only)
router.put('/:id/complete', verifyToken, isMentor, sessionController.markSessionCompleted);


module.exports = router;

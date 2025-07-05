// backend/routes/requestroutes.js
const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController"); // Import request controller functions

// Import authentication and role-based middleware from your authMiddleware file
const { verifyToken, isMentee, isMentor } = require("../middleware/authMiddleware");

// All routes in this router are mounted under '/api/requests' in app.js
// and are already protected by 'verifyToken' there.
// However, we explicitly add 'verifyToken' here for clarity and
// apply 'isMentee' or 'isMentor' middleware to enforce role-specific access as per PRD.

// @route   POST /api/requests/send
// @desc    Mentee sends a mentorship request to a mentor
// @access  Private (Mentee only)
// PRD: "Mentees send mentorship requests to mentors"
// The path is just '/' because this router is already mounted at '/api/requests'
router.post("/send", verifyToken, isMentee, requestController.sendRequest);

// @route   GET /api/requests/sent
// @desc    Mentee views requests they have sent
// @access  Private (Mentee only)
// PRD: "Mentees can view their sent requests"
router.get("/sent", verifyToken, isMentee, requestController.getSentRequests);

// @route   GET /api/requests/received
// @desc    Mentor views requests they have received
// @access  Private (Mentor only)
// PRD: "Mentors can view requests they have received"
router.get("/received", verifyToken, isMentor, requestController.getReceivedRequests);

// @route   PUT /api/requests/:id
// @desc    Mentor updates the status of a specific mentorship request (ACCEPT/REJECT)
// @access  Private (Mentor only)
// PRD: "Mentors accept/reject requests"
router.put("/:id", verifyToken, isMentor, requestController.updateRequestStatus);

module.exports = router;

// backend/controllers/requestController.js
const Request = require("../models/Request"); // Assuming you have a Request model defined
const User = require("../models/User"); // Required for populating user details

// @desc    Send a new mentorship request from a mentee to a mentor
// @route   POST /api/requests/send
// @access  Private (mentee-only)
// PRD: "Mentees send mentorship requests to mentors"
exports.sendRequest = async (req, res) => {
  // Ensure the user is authenticated and is a mentee
  if (!req.user || req.user.role !== 'mentee' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentees can send requests.' });
  }

  const menteeId = req.user._id; // Mentee ID comes from the authenticated token
  const { mentorId, message } = req.body; // Mentor ID and message come from the request body

  // --- Input Validation ---
  if (!mentorId || !message) {
    return res.status(400).json({ error: "Mentor ID and message are required to send a request." });
  }

  try {
    // Check if mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: "Selected mentor not found or is not a mentor." });
    }

    // Optional: Check if a pending request already exists between these two users
    const existingPendingRequest = await Request.findOne({
      mentee: menteeId,
      mentor: mentorId,
      status: "PENDING"
    });
    if (existingPendingRequest) {
      return res.status(409).json({ error: "A pending request to this mentor already exists." });
    }


    const newRequest = new Request({
      mentee: menteeId, // Use 'mentee' as field name to match common Mongoose reference pattern
      mentor: mentorId, // Use 'mentor' as field name
      message,
      status: "PENDING" // New requests are always PENDING by default
    });

    await newRequest.save();

    // Populate mentee and mentor details for the response
    const populatedRequest = await Request.findById(newRequest._id)
      .populate('mentee', 'fullName email')
      .populate('mentor', 'fullName email');

    res.status(201).json({ message: "Mentorship request sent successfully!", request: populatedRequest });
  } catch (err) {
    console.error("❗ Failed to send mentorship request:", err);
    res.status(500).json({ error: "Server error. Failed to send request." });
  }
};

// @desc    Get all requests sent by the authenticated mentee
// @route   GET /api/requests/sent
// @access  Private (mentee-only)
// PRD: "Mentees can view their sent requests"
exports.getSentRequests = async (req, res) => {
  // Ensure the user is authenticated and is a mentee
  if (!req.user || req.user.role !== 'mentee' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentees can view their sent requests.' });
  }

  const menteeId = req.user._id; // Mentee ID comes from the authenticated token

  try {
    // Find requests where the current user is the mentee
    const requests = await Request.find({ mentee: menteeId })
      .populate("mentor", "fullName email") // Populate mentor's details
      .select("-__v"); // Exclude Mongoose version key

    if (!requests || requests.length === 0) {
      return res.status(200).json({ message: "No sent requests found.", requests: [] });
    }

    res.status(200).json({ message: "Sent requests fetched successfully!", requests });
  } catch (err) {
    console.error("❗ Failed to load sent requests:", err);
    res.status(500).json({ error: "Server error. Failed to load sent requests." });
  }
};

// @desc    Get all requests received by the authenticated mentor
// @route   GET /api/requests/received
// @access  Private (mentor-only)
// PRD: "Mentors can view requests they have received"
exports.getReceivedRequests = async (req, res) => {
  // Ensure the user is authenticated and is a mentor
  if (!req.user || req.user.role !== 'mentor' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentors can view their received requests.' });
  }

  const mentorId = req.user._id; // Mentor ID comes from the authenticated token

  try {
    // Find requests where the current user is the mentor
    const requests = await Request.find({ mentor: mentorId })
      .populate("mentee", "fullName email skills goals") // ADDED: 'skills' and 'goals' to population
      .select("-__v"); // Exclude Mongoose version key

    if (!requests || requests.length === 0) {
      return res.status(200).json({ message: "No received requests found.", requests: [] });
    }

    res.status(200).json({ message: "Received requests fetched successfully!", requests });
  } catch (err) {
    console.error("❗ Failed to load received requests:", err);
    res.status(500).json({ error: "Server error. Failed to load received requests." });
  }
};

// @desc    Update the status of a specific mentorship request (e.g., ACCEPTED/REJECTED)
// @route   PUT /api/requests/:id
// @access  Private (mentor-only)
// PRD: "Mentors accept/reject requests"
exports.updateRequestStatus = async (req, res) => {
  // Ensure the user is authenticated and is a mentor
  if (!req.user || req.user.role !== 'mentor' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentors can update request status.' });
  }

  const { id } = req.params; // Request ID from URL parameter
  const { status } = req.body; // New status from request body

  // --- Input Validation ---
  if (!status || !["ACCEPTED", "REJECTED"].includes(status.toUpperCase())) {
    return res.status(400).json({ error: "Invalid or missing status provided. Must be 'ACCEPTED' or 'REJECTED'." });
  }

  try {
    // Find the request by ID and ensure it belongs to the authenticated mentor
    const requestToUpdate = await Request.findOne({ _id: id, mentor: req.user._id });

    if (!requestToUpdate) {
      return res.status(404).json({ error: "Request not found or you are not authorized to update it." });
    }

    // Only allow updating if the current status is PENDING
    if (requestToUpdate.status !== "PENDING") {
      return res.status(400).json({ error: `Request status is already ${requestToUpdate.status} and cannot be changed.` });
    }

    requestToUpdate.status = status.toUpperCase();
    await requestToUpdate.save();

    // Optionally, if a request is ACCEPTED, you might want to create a new Session entry here
    // This depends on your session creation flow. For now, just update the request status.

    // Populate mentee and mentor details for the response
    const populatedRequest = await Request.findById(requestToUpdate._id)
      .populate('mentee', 'fullName email')
      .populate('mentor', 'fullName email');

    res.status(200).json({ message: "Request status updated successfully!", request: populatedRequest });
  } catch (err) {
    console.error("❗ Failed to update request status:", err);
    res.status(500).json({ error: "Server error. Failed to update request status." });
  }
};

// backend/controllers/sessionController.js
const Session = require("../models/Session"); // Assuming you have a Session model defined
const User = require("../models/User"); // Required for populating user details if needed

// @desc    Create a new mentorship session (typically triggered after a request is ACCEPTED)
// @route   POST /api/sessions
// @access  Private (mentee-only for booking, or possibly admin for manual creation)
// PRD implies sessions are created upon acceptance of a request, and mentees book.
exports.createSession = async (req, res) => {
  // Ensure the user is authenticated and is a mentee (for booking) or admin (for manual creation)
  if (!req.user || (req.user.role !== 'mentee' && req.user.role !== 'admin') || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentees or admins can create sessions via this endpoint.' });
  }

  // When a mentee books, their ID comes from the authenticated token.
  // The mentorId and date come from the request body.
  const menteeIdFromToken = req.user._id;
  const { mentorId, date } = req.body; // 'mentorId' from frontend selection, 'date' is the chosen slot date

  // --- Input Validation ---
  if (!mentorId || !date) {
    return res.status(400).json({ error: "Mentor ID and session date are required to create a session." });
  }

  try {
    // Verify menteeId from token exists and has 'mentee' role (redundant if middleware handles, but safe)
    const mentee = await User.findById(menteeIdFromToken);
    if (!mentee || mentee.role !== 'mentee') {
      return res.status(403).json({ error: "Authenticated user is not a mentee or not found." });
    }

    // Verify mentorId exists and has 'mentor' role
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ error: "Selected mentor not found or is not a mentor." });
    }

    // Optional: You might also check if this specific session date/time conflicts with mentor's availability here.
    // This would involve checking the mentor's `availability` array for the specific day and time.
    // For MVP, we assume the frontend only presents truly available slots.

    const newSession = new Session({
      mentor: mentorId, // Mentor ID comes from the request body (selected by mentee)
      mentee: menteeIdFromToken, // Mentee ID comes from the authenticated token
      date: new Date(date), // Ensure date is a Date object
      status: "SCHEDULED", // Default status for new sessions
      notes: "" // Initialize notes
    });

    await newSession.save();

    // Populate user details for the response
    const populatedSession = await Session.findById(newSession._id)
      .populate('mentor', 'fullName email')
      .populate('mentee', 'fullName email');

    res.status(201).json({ message: "Mentorship session created successfully!", session: populatedSession });
  } catch (err) {
    console.error("❗ Failed to create session:", err);
    // Handle validation errors from Mongoose schema if any
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error. Failed to create session." });
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
    const sessions = await Session.find({ mentor: mentorId }) // Use 'mentor' field
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

// @desc    Get all sessions for the authenticated mentee
// @route   GET /api/sessions/mentee
// @access  Private (mentee-only)
// PRD: "Mentees view upcoming and past mentorship sessions"
exports.getMenteeSessions = async (req, res) => {
  // Ensure the user is authenticated and is a mentee
  if (!req.user || req.user.role !== 'mentee' || !req.user._id) {
    return res.status(403).json({ error: 'Access denied. Only mentees can view their sessions.' });
  }

  const menteeId = req.user._id; // Get mentee's ID from the authenticated token

  try {
    // Find sessions where the current user is the mentee
    // Populate mentor details
    const sessions = await Session.find({ mentee: menteeId }) // Use 'mentee' field
      .populate('mentor', 'fullName email') // Populate mentor's full name and email
      .select('-__v'); // Exclude Mongoose version key

    if (!sessions || sessions.length === 0) {
      return res.status(200).json({ message: "No sessions found for this mentee.", sessions: [] });
    }

    res.status(200).json({ message: "Sessions fetched successfully!", sessions });
  } catch (err) {
    console.error("❗ Failed to fetch mentee sessions:", err);
    res.status(500).json({ error: "Server error. Failed to fetch mentee sessions." });
  }
};

// @desc    Submit feedback/rating for a session
// @route   PUT /api/sessions/:id/feedback
// @access  Private (mentee or mentor, depending on who is submitting which feedback)
// PRD: "After a session, the mentee is asked to rate it (1–5 stars) and leave a comment."
// PRD: "Mentors can also leave optional comments about the session."
exports.submitFeedback = async (req, res) => {
  // Ensure the user is authenticated
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'Not authorized. Please log in.' });
  }

  const { id } = req.params; // Session ID from URL parameter
  const { menteeRating, menteeFeedback, mentorFeedback } = req.body; // Feedback fields from request body

  // --- Input Validation ---
  // At least one feedback field must be provided
  if (!menteeRating && !menteeFeedback && !mentorFeedback) {
    return res.status(400).json({ error: "No feedback or rating provided." });
  }
  // Validate mentee rating if provided
  if (menteeRating !== undefined && (menteeRating < 1 || menteeRating > 5)) {
    return res.status(400).json({ error: "Mentee rating must be between 1 and 5." });
  }

  try {
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Determine who is submitting feedback and authorize them
    if (req.user.role === 'mentee') {
      // Mentee can only submit feedback for sessions where they are the mentee
      if (session.mentee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only submit feedback for your own mentee sessions.' });
      }
      // Ensure mentee feedback/rating is only set by mentee
      if (menteeRating !== undefined) session.menteeRating = menteeRating;
      if (menteeFeedback) session.menteeFeedback = menteeFeedback;
    } else if (req.user.role === 'mentor') {
      // Mentor can only submit feedback for sessions where they are the mentor
      if (session.mentor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only submit feedback for your own mentor sessions.' });
      }
      // Ensure mentor feedback is only set by mentor
      if (mentorFeedback) session.mentorFeedback = mentorFeedback;
    } else {
      // Admin could potentially update both, but this is a simplified flow
      // For now, only mentee and mentor roles are explicitly handled for feedback submission.
      return res.status(403).json({ error: 'Access denied. Only mentees or mentors can submit feedback.' });
    }

    await session.save();

    // Populate details for the response
    const populatedSession = await Session.findById(session._id)
      .populate('mentor', 'fullName email')
      .populate('mentee', 'fullName email');

    res.status(200).json({ message: "Feedback submitted successfully!", session: populatedSession });
  } catch (err) {
    console.error("❗ Failed to submit feedback:", err);
    // Handle validation errors from Mongoose schema if any
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error. Failed to submit feedback." });
  }
};

// @desc    Mentor marks a session as completed
// @route   PUT /api/sessions/:id/complete
// @access  Private (mentor-only)
exports.markSessionCompleted = async (req, res) => {
  const { id } = req.params; // Session ID
  const userId = req.user._id; // Authenticated user's ID
  const userRole = req.user.role; // Authenticated user's role

  try {
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    // Ensure only the mentor of this session can mark it as completed
    if (userRole !== 'mentor' || session.mentor.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to mark this session as completed.' });
    }

    // Only allow marking as completed if it's not already completed or cancelled
    if (session.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Session is already marked as completed.' });
    }
    if (session.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot mark a cancelled session as completed.' });
    }

    session.status = 'COMPLETED';
    await session.save();

    res.status(200).json({ message: 'Session marked as completed successfully.', session });
  } catch (err) {
    console.error('Error marking session as completed:', err);
    res.status(500).json({ error: 'Server error marking session as completed.' });
  }
};

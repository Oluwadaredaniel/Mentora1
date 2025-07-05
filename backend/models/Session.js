// backend/models/Session.js
const mongoose = require("mongoose");

// Define the Session schema
const sessionSchema = new mongoose.Schema({
  mentor: { // Changed from mentorId to mentor for consistency with sessionController
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model
    required: true,
  },
  mentee: { // Changed from menteeId to mentee for consistency with sessionController
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model
    required: true,
  },
  date: { // Date and time of the session
    type: Date,
    required: true,
  },
  status: { // Status of the session as per PRD (e.g., SCHEDULED, COMPLETED, CANCELLED)
    type: String,
    enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "PENDING_FEEDBACK"], // Added PENDING_FEEDBACK for tracking
    default: "SCHEDULED", // Default status for newly created sessions
    required: true,
  },
  notes: { // Optional notes for the mentor (private)
    type: String,
    default: "",
    trim: true,
  },
  menteeRating: { // Mentee's rating of the session (1-5 stars) as per PRD
    type: Number,
    min: [1, 'Rating must be at least 1.'],
    max: [5, 'Rating cannot exceed 5.'],
    // This field is optional, will only be set if mentee provides it
  },
  menteeFeedback: { // Mentee's written feedback/comment as per PRD
    type: String,
    default: "",
    trim: true,
    maxlength: [1000, 'Mentee feedback cannot exceed 1000 characters.'] // Optional: limit length
  },
  mentorFeedback: { // Mentor's optional comment/feedback as per PRD
    type: String,
    default: "",
    trim: true,
    maxlength: [1000, 'Mentor feedback cannot exceed 1000 characters.'] // Optional: limit length
  },
  // createdAt and updatedAt will be automatically added by timestamps: true
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Add indexes for efficient querying of sessions by mentor, mentee, and date
sessionSchema.index({ mentor: 1, date: 1 });
sessionSchema.index({ mentee: 1, date: 1 });

// Export the Session model
module.exports = mongoose.model("Session", sessionSchema);

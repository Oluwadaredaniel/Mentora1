// backend/models/Request.js
const mongoose = require("mongoose");

// Define the Request schema
const requestSchema = new mongoose.Schema({
  mentee: { // Changed from menteeId to mentee for consistency with requestController
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model
    required: true,
  },
  mentor: { // Changed from mentorId to mentor for consistency with requestController
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"], // Enforces specific statuses as per PRD
    default: "PENDING", // New requests start as PENDING
    required: true, // Status should always be defined
  },
  message: { // Message from mentee to mentor
    type: String,
    default: "",
    trim: true, // Removes whitespace
    maxlength: [1000, 'Message cannot exceed 1000 characters.'] // Optional: limit message length
  },
  // createdAt is already defined, and timestamps: true will add updatedAt
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Add index to improve performance for queries by mentee, mentor, and status
requestSchema.index({ mentee: 1, mentor: 1, status: 1 });

// Export the Request model
module.exports = mongoose.model("Request", requestSchema);

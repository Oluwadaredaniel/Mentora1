// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For password hashing

// Define the User schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true, // Removes whitespace from both ends of a string
    minlength: [3, 'Full name must be at least 3 characters long.'] // Added minimum length for full name
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email addresses are unique
    lowercase: true, // Converts email to lowercase before saving
    match: [/.+@.+\..+/, 'Please enter a valid email address.'] // Basic email format validation
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters long.'] // PRD-aligned password minimum length
  },
  role: {
    type: String,
    enum: ["admin", "mentor", "mentee"], // Enforces specific roles as per PRD
    default: "mentee", // Default role for new registrations as per PRD
    required: true // Role should always be defined
  },
  bio: {
    type: String,
    default: "", // Short bio as per PRD
    maxlength: [500, 'Bio cannot exceed 500 characters.'] // Optional: limit bio length
  },
  skills: {
    type: [String], // Array of strings for skills, from a selectable list (frontend handles selection)
    default: [],
    // You might add custom validation here to ensure skills come from a predefined list if strict
  },
  goals: { // Added as per PRD: "Goals (e.g., “Improve product design skills”)"
    type: [String], // Can be an array of strings if a user has multiple goals
    default: [],
  },
  interests: { // This field can be used as an optional tag for "industry" as per PRD, or personal interests
    type: [String],
    default: []
  },
  availability: { // For mentors to set weekly availability blocks as per PRD
    type: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] // Enforce valid days
        },
        startTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format (24-hour).'] // HH:MM format
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format (24-hour).'] // HH:MM format
        }
      }
    ],
    default: [],
    // You might add a custom validator to ensure endTime is after startTime if needed
  },
  isProfileComplete: { // Helper field for frontend redirection after login/registration
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now // Timestamp for when the user was created
  },
  updatedAt: { // Automatically track when the user document was last updated
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically. We already have createdAt, so this will manage updatedAt.
});

// Middleware to hash password before saving a new user or updating password
// This 'pre-save' hook ensures passwords are always hashed before being stored in the database.
userSchema.pre("save", async function (next) {
  // Only hash the password if it's new or has been modified
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Proceed to save
  } catch (err) {
    next(err); // Pass error to Mongoose error handling
  }
});

// Middleware to update `updatedAt` field on `findOneAndUpdate`
userSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Instance method to compare a given password with the hashed password in the database
// Used during the login process.
userSchema.methods.comparePassword = async function (candidatePassword) {
  // `this.password` refers to the hashed password stored in the document
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
module.exports = mongoose.model("User", userSchema);

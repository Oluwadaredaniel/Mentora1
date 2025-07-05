// app.js (or server.js)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Import authentication middleware from the Canvas document
const authMiddleware = require('./middleware/authMiddleware'); // Path to your authMiddleware.js

// Import route files
const authRoutes = require('./routes/authRoutes');
const adminroutes = require('./routes/adminroutes');
const mentorroutes = require('./routes/mentorroutes');
const requestroutes = require('./routes/requestroutes');
const sessionroutes = require('./routes/sessionroutes');

const app = express();

// --- CORS Configuration - IMPORTANT FOR DEPLOYMENT ---
// For development, include your local frontend URLs (e.g., Vite's default 5173 or React's 3000)
// For production, process.env.FRONTEND_URL will be your Vercel frontend URL
const allowedOrigins = [
  'http://localhost:3000', // Common for Create React App
  'http://localhost:5173', // Common for Vite React App
  process.env.FRONTEND_URL // This will be set in Vercel for your deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    // This is often needed for non-browser clients or direct API calls.
    if (!origin) return callback(null, true);

    // If the origin is in our allowed list, permit the request
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // If the origin is not allowed, reject the request
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      callback(new Error(msg), false);
    }
  },
  credentials: true // Important if your frontend sends cookies or authorization headers
}));

// Middleware for parsing JSON request bodies
app.use(express.json());

// --- Public Routes (Authentication) ---
// These routes do NOT require a token to access initially.
// Login and Register endpoints are intentionally public.
app.use('/api/auth', authRoutes);

// --- Protected Routes (Applying Middleware) ---

// All /api/admin routes require a valid token AND an 'admin' role
// This ensures that only authenticated administrators can access these routes.
app.use('/api/admin', authMiddleware.verifyToken, authMiddleware.isAdmin, adminroutes);

// All /api/mentors routes require a valid token.
// Specific endpoints within mentorRoutes (e.g., setting availability) might also need authMiddleware.isMentor.
// For now, general mentor browsing might just need verifyToken.
app.use('/api/mentors', authMiddleware.verifyToken, mentorroutes);

// All /api/requests routes require a valid token.
// The specific actions (sending/viewing requests) will be controlled by mentee/mentor roles
// within the requestRoutes themselves or by applying specific role middleware here if all routes
// within requestRoutes are exclusively for a single role.
app.use('/api/requests', authMiddleware.verifyToken, requestroutes);

// All /api/sessions routes require a valid token.
// Similar to requests, specific session actions will be controlled by roles.
app.use('/api/sessions', authMiddleware.verifyToken, sessionroutes);


// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // Start the server only after successful database connection
    // Use process.env.PORT for Vercel, fallback to 5000 for local dev
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    // Exit process if DB connection fails
    process.exit(1);
  });

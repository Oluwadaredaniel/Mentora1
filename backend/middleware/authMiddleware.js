// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Used here for fetching user if needed for complex role checks, or just for type definition

// Make sure your .env file has a JWT_SECRET defined
const SECRET = process.env.JWT_SECRET;

// @desc    Middleware to verify JWT Token
// @access  Private (applied to routes that require authentication)
exports.verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in the Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET);

    // Attach the decoded user payload to the request object
    // Note: The JWT payload from authController uses '_id', so we'll use that here.
    // Ensure your JWT payload correctly contains '_id' and 'role'.
    req.user = decoded; // Should now be { _id: ..., role: ... }

    next(); // Move to the next middleware or route handler

  } catch (err) {
    console.error("❌ Token verification failed:", err);
    // Send 401 for invalid token or 403 for expired/malformed if more specific handling is desired
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Not authorized, token failed or is invalid.' });
  }
};

// @desc    Middleware to check if the authenticated user is an Admin
// @access  Private (applied to admin-only routes)
exports.isAdmin = (req, res, next) => {
  // This middleware assumes verifyToken has already run and populated req.user
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Requires Admin role.' });
  }
  next();
};

// @desc    Middleware to check if the authenticated user is a Mentor
// @access  Private (applied to mentor-only routes)
exports.isMentor = (req, res, next) => {
  if (!req.user || req.user.role !== 'mentor') {
    return res.status(403).json({ error: 'Access denied. Requires Mentor role.' });
  }
  next();
};

// @desc    Middleware to check if the authenticated user is a Mentee
// @access  Private (applied to mentee-only routes)
exports.isMentee = (req, res, next) => {
  if (!req.user || req.user.role !== 'mentee') {
    return res.status(403).json({ error: 'Access denied. Requires Mentee role.' });
  }
  next();
};

// You might also consider a general role-checking middleware if roles can overlap, e.g.:
/*
exports.hasRole = (requiredRole) => (req, res, next) => {
  if (!req.user || req.user.role !== requiredRole) {
    return res.status(403).json({ message: `Access denied. Requires ${requiredRole} role.` });
  }
  next();
};
*/

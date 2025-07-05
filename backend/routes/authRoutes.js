// backend/routes/auth.js
const express = require('express');
const router = express.Router();
// Import controller functions for handling authentication logic
// These functions (registerUser, loginUser, getMe, logoutUser, saveUserProfile)
// should be defined in '../controllers/authController.js'
const {
  registerUser,
  loginUser,
  getMe,        // Function to get currently authenticated user details
  logoutUser,   // Function to handle user logout
  saveUserProfile // Function to handle user profile saving/updating
} = require('../controllers/authController');

// Import authentication middleware to protect routes
// This middleware will verify JWTs and attach user info to the request
// Correctly import verifyToken, isAdmin, isMentor, isMentee from authMiddleware
const { verifyToken, isAdmin, isMentor, isMentee } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// PRD: "POST /auth/register Register a new user (mentee/mentor/admin)"
// Note: Frontend (Register.tsx) hardcodes role to 'mentee' as per PRD:
// "Only Admins can create new users or assign roles (for now)".
// The `registerUser` controller must ensure new self-registered users are assigned 'mentee' role.
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
// PRD: "POST /auth/login Log in and receive a JWT"
// The `loginUser` controller must validate credentials, generate a JWT,
// and return it along with basic user info (id, email, role, isProfileComplete).
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get currently authenticated user's details
// @access  Private (requires token)
// PRD: "GET /auth/me Get the currently authenticated user"
// This endpoint requires authentication (JWT verification).
// The `verifyToken` middleware will protect this route, and `getMe` will return
// the user's information from the token or database.
router.get('/me', verifyToken, getMe); // FIXED: Changed authMiddleware to verifyToken

// @route   POST /api/auth/logout
// @desc    Log out user
// @access  Private (optional, for client-side token invalidation)
// PRD: "POST /auth/logout Log out user (optional, for client)"
// For JWTs, this often means just clearing the token on the client.
// If your backend maintains a blacklist of invalidated tokens, this route
// would handle adding the current token to that blacklist.
router.post('/logout', verifyToken, logoutUser); // FIXED: Changed authMiddleware to verifyToken


// @route   POST /api/auth/profile (Currently here, but PRD suggests PUT /users/me/profile)
// @desc    Save user profile details
// @access  Private (requires token)
// PRD for profile update: "PUT /users/me/profile Update own profile (bio, skills, goals)"
// While this route is currently within the auth router and is a POST,
// the PRD suggests it should be a PUT request on a `/users/me/profile` endpoint,
// likely residing in a separate 'users' router.
// For now, it remains as you provided, assuming `saveUserProfile` handles the logic.
router.post('/profile', verifyToken, saveUserProfile); // FIXED: Changed authMiddleware to verifyToken

module.exports = router;

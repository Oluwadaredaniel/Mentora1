// src/components/Navbar.tsx
import { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // IMPORTANT: Ensure 'jwt-decode' is installed (npm install jwt-decode)
import '../styles/styles.css'; // IMPORTANT: Verify this path is correct for your project structure

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  // Function to update auth state from localStorage, wrapped in useCallback for stability
  const updateAuthState = useCallback(() => {
    const token = localStorage.getItem('mentoraUserToken');
    const role = localStorage.getItem('mentoraUserRole');

    if (token && role) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token); // Using jwtDecode from named import
        const currentTime = Date.now() / 1000; // Current time in seconds

        if (decodedToken.exp < currentTime) {
          // Token has expired
          console.log("Token expired. Logging out automatically.");
          handleLogout(); // Call handleLogout to clear storage and redirect
          return; // Exit early as we're logging out
        }

        // Token is valid and not expired
        setIsAuthenticated(true);
        setUserRole(role);
      } catch (error) {
        // Error decoding token (e.g., malformed token, or jwt-decode not installed/imported correctly)
        console.error("Error decoding token. Logging out automatically:", error);
        handleLogout(); // Treat as invalid token and log out
      }
    } else {
      // No token or role found in localStorage
      setIsAuthenticated(false);
      setUserRole('');
    }
  }, [navigate]); // Added navigate to dependencies as handleLogout uses it

  useEffect(() => {
    // Initial check on component mount to set authentication state
    updateAuthState();

    // Set up an interval to periodically check token expiration (e.g., every minute)
    // This acts as a fallback and ensures logout even if the user is idle
    const intervalId = setInterval(updateAuthState, 60 * 1000); // Check every 1 minute

    // Add an event listener for 'storage' changes. This is important for
    // keeping state in sync if a user logs in/out in a different browser tab/window.
    window.addEventListener('storage', updateAuthState);

    // Cleanup function to remove the event listener and clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', updateAuthState);
    };
  }, [updateAuthState]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all relevant items from local storage
    setIsAuthenticated(false); // Update state
    setUserRole(''); // Clear role state
    navigate('/login'); // Redirect to login page
    setMenuOpen(false); // Close menu on logout
  };

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin/AdminDashboard';
    if (userRole === 'mentor') return '/mentor/dashboard';
    if (userRole === 'mentee') return '/mentee/dashboard';
    return '/'; // Default path if not authenticated or role not recognized
  };

  return (
    <header className="main-header">
      <nav className="navbar">
        <div className="logo">
          <NavLink to="/">Mentora</NavLink>
        </div>

        {/* Hamburger button using inline SVG for reliability */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {/* Inline SVG for hamburger icon / close icon */}
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              // Close icon (X) when menu is open
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger icon when menu is closed
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Navigation links. The 'open' class will be managed by your CSS for mobile responsiveness. */}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/About" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              About
            </NavLink>
          </li>
          {/* Removed the extra </li> tag here that was causing the error */}
          <li>
            <NavLink to="/Contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              Contact
            </NavLink>
          </li>
          <li>
            <NavLink to="/HowItWorks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
              How It Works
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <NavLink to={getDashboardPath()} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <button onClick={handleLogout} className="nav-link logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode for robust token decoding
import "../../styles/styles.css"; // Ensure this path is correct for your project

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- API Base URL Declaration ---
  // It will read from VITE_API_BASE_URL environment variable (from frontend/.env or Vercel)
  // If the environment variable is not set (e.g., during local development without a .env),
  // it will fallback to "http://localhost:5000/api".
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // Trim whitespace from email and password before sending
      const trimmedEmail = formData.email.trim();
      const trimmedPassword = formData.password.trim();

      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Use the error message from the backend if available, otherwise a generic one
        setError(errorData.error || "Login failed. Please check your credentials.");
        setLoading(false); // Stop loading on error
        return;
      }

      const { user, token } = await response.json();

      // Store token and user information in localStorage
      localStorage.setItem("mentoraUserToken", token);
      localStorage.setItem("mentoraUserEmail", user.email);
      localStorage.setItem("mentoraUserFullName", user.fullName || user.name || ''); // Ensure 'fullName' is stored
      localStorage.setItem("mentoraUserId", user._id || user.id);
      localStorage.setItem("mentoraUserRole", user.role);

      // --- Token Expiry Logic (Using jwtDecode for consistency and robustness) ---
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
        const timeLeft = expiryTime - Date.now();

        if (timeLeft > 0) {
          setTimeout(() => {
            console.log("Your session has expired. Please log in again."); // Changed alert to console.log
            localStorage.clear(); // Clear all stored user data
            navigate("/login");
          }, timeLeft);
        }
      } catch (decodeError) {
        console.warn("Failed to decode token for expiry check:", decodeError);
      }
      // --- End Token Expiry Logic ---

      // Redirect based on profile completion and role
      if (!user.isProfileComplete) {
        navigate("/Profile");
      } else if (user.role === "admin") {
        navigate("/admin/AdminDashboard");
      } else if (user.role === "mentor") {
        navigate("/mentor/dashboard");
      } else { // This will catch the 'mentee' role and any other unexpected roles
        navigate("/mentee/dashboard");
      }

    } catch (err) {
      console.error("Login network error:", err);
      setError("Failed to connect to the server. Please try again later.");
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Mentora</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.9rem", color: "#3b82f6" }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#3b82f6", fontWeight: "bold" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

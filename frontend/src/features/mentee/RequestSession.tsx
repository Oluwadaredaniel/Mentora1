// src/features/mentee/RequestSession.tsx
import React, { useEffect, useState } from "react";
// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

// Interface for Mentor, as received from the BrowseMentors page's state
interface Mentor {
  _id: string;
  fullName: string;
  email: string;
  bio?: string;
  skills?: string[];
  goals?: string[];
}

const RequestSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Safely get the mentor object from location.state.
  // If location.state is null or doesn't contain 'mentor', 'selectedMentor' will be null.
  const selectedMentor = (location.state as { mentor: Mentor } | null)?.mentor || null;

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // State for API submission loading
  const [error, setError] = useState(""); // State for displaying errors
  const [successMessage, setSuccessMessage] = useState(""); // State for displaying success messages

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Effect to handle redirection if no mentor data is available
  useEffect(() => {
    // Removed AOS initialization
    // AOS.init({ duration: 800, once: true });
    // Only redirect if no mentor data AND no success message is currently displayed
    // This prevents immediate redirect after successful submission before message can be seen
    if ((!selectedMentor || !selectedMentor._id) && !successMessage) {
      console.warn("No mentor data found, redirecting to browse mentors.");
      navigate("/mentee/browse", { replace: true });
    }
  }, [selectedMentor, navigate, successMessage]); // Added successMessage to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setLoading(true); // Start loading state

    // Ensure mentor data is available before proceeding with the request
    if (!selectedMentor || !selectedMentor._id) {
      setError("No mentor selected. Please go back and select a mentor.");
      setLoading(false);
      console.error("DEBUG: handleSubmit - No selectedMentor found.");
      return;
    }

    // Basic validation for message
    if (message.trim().length < 10) {
      setError("Please write a more detailed message (at least 10 characters).");
      setLoading(false);
      console.warn("DEBUG: handleSubmit - Message too short.");
      return;
    }

    const token = localStorage.getItem("mentoraUserToken");
    const menteeId = localStorage.getItem("mentoraUserId"); // Assuming mentee ID is stored on login

    if (!token || !menteeId) {
      setError("Authentication required. Please log in as a mentee.");
      setLoading(false);
      console.error("DEBUG: handleSubmit - Token or menteeId missing from localStorage.");
      return;
    }

    console.log("DEBUG: Sending request with payload:", {
      menteeId,
      mentorId: selectedMentor._id,
      message,
    });
    console.log("DEBUG: Authorization Token:", token ? "Present" : "Missing"); // Log presence, not token itself for security

    try {
      // PRD: POST /api/requests/send - Mentees send mentorship requests to mentors
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/requests/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT for authentication
        },
        body: JSON.stringify({
          menteeId: menteeId, // Mentee ID from local storage
          mentorId: selectedMentor._id, // Mentor ID from the selected mentor object
          message: message, // Message from the form
        }),
      });

      console.log("DEBUG: Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Failed to send request. An unexpected error occurred.";
        const contentType = response.headers.get("content-type");

        // Attempt to parse JSON only if the content type is JSON
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (jsonError) {
            console.error("Failed to parse JSON error response:", jsonError);
            // If JSON parsing fails, use a generic message or the status text
            errorMessage = `Request failed: ${response.statusText || response.status}`;
          }
        } else {
          // If not JSON, use a generic error message based on status
          errorMessage = `Request failed with status ${response.status}: ${response.statusText || 'Server responded with non-JSON content.'}`;
        }
        console.error("DEBUG: Backend returned non-OK response:", errorMessage);
        throw new Error(errorMessage);
      }

      // If response is OK, then parse JSON
      const data = await response.json();
      console.log("DEBUG: Backend response data:", data);

      setSuccessMessage("Your mentorship request has been sent successfully!");
      setMessage(""); // Clear message field
      console.log("DEBUG: Request sent successfully, navigating to /mentee/requests");
      // Optionally, navigate to "My Requests" page after successful submission
      setTimeout(() => {
        navigate("/mentee/requests");
      }, 2000); // Navigate after 2 seconds
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("DEBUG: Send request caught error:", err);
      setError((err instanceof Error ? err.message : "An unexpected error occurred") || "An unexpected error occurred while sending your request.");
    } finally {
      setLoading(false); // End loading state
      console.log("DEBUG: Request submission process finished.");
    }
  };

  // Render a loading or redirect message if mentor data is not yet available
  if (!selectedMentor) {
    return (
      <>
        <Navbar />
        <main className="request-session-page section-padding container">
          <p style={{ textAlign: "center" }}>Loading mentor details or redirecting...</p>
        </main>
        <Footer />
      </>
    );
  }

  // If mentor data is available, render the main form
  return (
    <>
      <Navbar />
      <main className="request-session-page">
        <section className="hero-section">
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h2 className="section-title">Request Session with {selectedMentor.fullName}</h2>
            <p>Fill out the form below to send a mentorship request to {selectedMentor.fullName}.</p>
          </div>
        </section>

        <section className="section-padding container">
          {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}
          {successMessage && <p className="success-text" style={{ textAlign: 'center' }}>{successMessage}</p>}

          <div className="mentor-details-card"> {/* Removed data-aos attribute */}
            <h3>Mentor Details:</h3>
            <p><strong>Name:</strong> {selectedMentor.fullName}</p>
            <p><strong>Email:</strong> {selectedMentor.email}</p>
            <p><strong>Bio:</strong> {selectedMentor.bio || "No bio provided."}</p>
            {selectedMentor.skills && selectedMentor.skills.length > 0 && (
              <p><strong>Skills:</strong> {selectedMentor.skills.join(", ")}</p>
            )}
            {selectedMentor.goals && selectedMentor.goals.length > 0 && (
              <p><strong>Goals:</strong> {selectedMentor.goals.join(", ")}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="request-form"> {/* Removed data-aos attribute */}
            <div className="form-group">
              <label htmlFor="message">Your Message to {selectedMentor.fullName}:</label>
              <textarea
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you'd like to connect, your specific goals, and what you hope to gain from this mentorship."
                required
                aria-label="Message to mentor"
              ></textarea>
            </div>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending Request..." : "Send Mentorship Request"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default RequestSession;

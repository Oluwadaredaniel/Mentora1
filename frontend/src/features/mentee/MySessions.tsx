import React, { useEffect, useState } from "react";
import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
import "aos/dist/aos.css"; // Ensure AOS styles are available
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

// Interface for a user object (mentor or mentee) as populated in Session
interface UserInSession {
  _id: string;
  fullName: string;
  email: string;
}

// Interface for a single mentorship session, from the mentee's perspective
interface Session {
  _id: string;
  date: string; // Date of the session (e.g., ISO string)
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "PENDING_FEEDBACK"; // Session status
  mentor: UserInSession; // Populated mentor details
  menteeRating?: number; // Mentee's rating (1-5 stars)
  menteeFeedback?: string; // Mentee's written feedback
  mentorFeedback?: string; // Mentor's optional feedback
  notes?: string; // Mentor's private notes (might not be shown to mentee)
}

const MenteeSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for feedback modal/form
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number | ''>('');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
    fetchSessions(); // Fetch mentee's sessions on component mount
  }, []);

  // Function to fetch all sessions for the authenticated mentee
  const fetchSessions = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /api/sessions/mentee - Mentees view upcoming and past mentorship sessions
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/sessions/mentee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT for authentication
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error(errorData.error || "Unauthorized. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(errorData.error || "Forbidden. You don’t have access to view sessions.");
        } else {
          throw new Error(errorData.error || "Failed to fetch sessions.");
        }
      }

      const data = await response.json();
      setSessions(data.sessions || []); // Assuming backend returns { sessions: [...] }
    } catch (err: any) {
      console.error("Fetch mentee sessions error:", err);
      setError(err.message || "An unexpected error occurred while fetching your sessions.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for opening feedback modal
  const handleOpenFeedbackModal = (session: Session) => {
    setSelectedSession(session);
    setFeedbackRating(session.menteeRating || ''); // Pre-fill if already rated
    setFeedbackComment(session.menteeFeedback || ''); // Pre-fill if already commented
    setShowFeedbackModal(true);
  };

  // Handler for submitting feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmittingFeedback(true);

    if (!selectedSession) {
      setError("No session selected for feedback.");
      setIsSubmittingFeedback(false);
      return;
    }
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
      setError("Please provide a rating between 1 and 5.");
      setIsSubmittingFeedback(false);
      return;
    }

    const token = localStorage.getItem("mentoraUserToken");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setIsSubmittingFeedback(false);
      return;
    }

    try {
      // PRD: PUT /api/sessions/:id/feedback Mentee submits rating and comment
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/sessions/${selectedSession._id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menteeRating: feedbackRating, menteeFeedback: feedbackComment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback.");
      }

      setSuccessMessage("Feedback submitted successfully!");
      setShowFeedbackModal(false); // Close modal on success
      setSelectedSession(null); // Clear selected session
      setFeedbackRating('');
      setFeedbackComment('');
      fetchSessions(); // Refresh sessions to show updated feedback
    } catch (err: any) {
      console.error("Submit feedback error:", err);
      setError(err.message || "An unexpected error occurred while submitting feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mentee-sessions-page">
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title" data-aos="fade-up">My Mentorship Sessions</h2>

            {error && <p className="error-text" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && <p className="success-text" style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}

            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading your sessions...</p>
            ) : sessions.length === 0 ? (
              <p style={{ textAlign: 'center' }}>No sessions found. Start by browsing mentors!</p>
            ) : (
              <div className="table-responsive"> {/* For better responsiveness on smaller screens */}
                <table className="admin-table" data-aos="fade-up" data-aos-delay="100">
                  <thead>
                    <tr>
                      <th>Mentor</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Your Rating</th>
                      <th>Your Feedback</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session._id}>
                        <td>{session.mentor.fullName} ({session.mentor.email})</td>
                        <td>{new Date(session.date).toLocaleString()}</td>
                        <td>{session.status}</td>
                        <td>
                          {session.menteeRating !== undefined ? `${session.menteeRating} / 5` : "N/A"}
                        </td>
                        <td>
                          {session.menteeFeedback || "No feedback left."}
                        </td>
                        <td>
                          {session.status === "COMPLETED" && !session.menteeRating ? ( // Only allow feedback for completed sessions without existing rating
                            <button
                              className="primary-btn small-btn"
                              onClick={() => handleOpenFeedbackModal(session)}
                            >
                              Leave Feedback
                            </button>
                          ) : session.status === "COMPLETED" ? (
                            <button
                               className="secondary-btn small-btn"
                               onClick={() => handleOpenFeedbackModal(session)}
                            >
                               View/Edit Feedback
                            </button>
                          ) : (
                            <span style={{ color: '#666' }}>—</span> // No action for other statuses
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content" data-aos="zoom-in">
            <h3>Feedback for Session with {selectedSession.mentor.fullName}</h3>
            <p>On: {new Date(selectedSession.date).toLocaleString()}</p>
            <form onSubmit={handleSubmitFeedback}>
              <div className="form-group">
                <label htmlFor="rating">Rating (1-5 Stars):</label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="5"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(parseInt(e.target.value) || '')}
                  required
                  aria-label="Session Rating"
                />
              </div>
              <div className="form-group">
                <label htmlFor="comment">Your Feedback:</label>
                <textarea
                  id="comment"
                  rows={4}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your thoughts about the session..."
                  aria-label="Session Feedback Comment"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={isSubmittingFeedback}>
                  {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowFeedbackModal(false)}
                  disabled={isSubmittingFeedback}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MenteeSessions;

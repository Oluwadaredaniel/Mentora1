import React, { useEffect, useState } from "react";
import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
import "aos/dist/aos.css"; // Ensure AOS styles are available
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

interface UserInSession {
  _id: string;
  fullName: string;
  email: string;
}

interface Session {
  _id: string;
  date: string; // Assuming date is a string that can be parsed (e.g., ISO format)
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "PENDING_FEEDBACK"; // Session status
  notes?: string; // Optional field for mentor notes during a session
  mentee: {
    _id: string; // Include mentee ID for potential future actions
    fullName: string;
    email: string;
  };
  menteeRating?: number; // 1-5 stars
  menteeFeedback?: string; // Mentee's comment
  mentorFeedback?: string; // Mentor's optional comment
}

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // State for displaying errors
  const [successMessage, setSuccessMessage] = useState(""); // State for displaying success messages

  // State for mentor feedback modal/form
  const [showMentorFeedbackModal, setShowMentorFeedbackModal] = useState(false);
  const [selectedSessionForMentorFeedback, setSelectedSessionForMentorFeedback] = useState<Session | null>(null);
  const [mentorFeedbackText, setMentorFeedbackText] = useState('');
  const [isSubmittingMentorFeedback, setIsSubmittingMentorFeedback] = useState(false);

  // State for "Mark as Completed" button loading
  const [markingCompletedId, setMarkingCompletedId] = useState<string | null>(null);

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
    fetchSessions(); // Fetch sessions when the component mounts
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    const token = localStorage.getItem("mentoraUserToken"); // Get JWT from local storage

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /sessions/mentor - Get all sessions where the current user is the mentor
      const response = await fetch(`${API_BASE_URL}/sessions/mentor`, {
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
          throw new Error(errorData.error || "Forbidden. You don’t have access to this page.");
        } else {
          throw new Error(errorData.error || "Failed to fetch sessions.");
        }
      }

      const data = await response.json();
      setSessions(data.sessions || data || []);

    } catch (err: any) {
      console.error("Fetch sessions error:", err);
      setError(err.message || "An unexpected error occurred while fetching sessions.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for opening mentor feedback modal
  const handleOpenMentorFeedbackModal = (session: Session) => {
    setSelectedSessionForMentorFeedback(session);
    setMentorFeedbackText(session.mentorFeedback || session.notes || ''); // Pre-fill with existing feedback/notes
    setShowMentorFeedbackModal(true);
    setError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear any previous success messages
  };

  // Handler for submitting mentor feedback
  const handleSubmitMentorFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmittingMentorFeedback(true);

    if (!selectedSessionForMentorFeedback) {
      setError("No session selected for feedback.");
      setIsSubmittingMentorFeedback(false);
      return;
    }
    if (!mentorFeedbackText.trim()) {
      setError("Feedback cannot be empty.");
      setIsSubmittingMentorFeedback(false);
      return;
    }

    const token = localStorage.getItem("mentoraUserToken");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setIsSubmittingMentorFeedback(false);
      return;
    }

    try {
      // PRD: Mentors can also leave optional comments about the session.
      // Backend: PUT /api/sessions/:id/feedback
      const response = await fetch(`${API_BASE_URL}/sessions/${selectedSessionForMentorFeedback._id}/feedback`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorFeedback: mentorFeedbackText }), // Send mentor's feedback
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit mentor feedback.");
      }

      setSuccessMessage("Your feedback has been saved successfully!");
      setShowMentorFeedbackModal(false); // Close modal on success
      setSelectedSessionForMentorFeedback(null); // Clear selected session
      setMentorFeedbackText('');
      fetchSessions(); // Refresh sessions to show updated feedback
    } catch (err: any) {
      console.error("Submit mentor feedback error:", err);
      setError(err.message || "An unexpected error occurred while submitting your feedback.");
    } finally {
      setIsSubmittingMentorFeedback(false);
    }
  };

  // Handler for marking a session as completed
  const handleMarkCompleted = async (sessionId: string) => {
    setError("");
    setSuccessMessage("");
    setMarkingCompletedId(sessionId); // Set loading state for this specific session

    const token = localStorage.getItem("mentoraUserToken");
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setMarkingCompletedId(null);
      return;
    }

    try {
      // Backend: PUT /api/sessions/:id/complete
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark session as completed.");
      }

      setSuccessMessage("Session marked as completed successfully!");
      fetchSessions(); // Refresh sessions to update status in the table
    } catch (err: any) {
      console.error("Mark session completed error:", err);
      setError(err.message || "An unexpected error occurred while marking session as completed.");
    } finally {
      setMarkingCompletedId(null); // Clear loading state
    }
  };


  return (
    <>
      <Navbar />
      <main className="mentor-sessions-page">
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title" data-aos="fade-up">My Mentorship Sessions</h2>

            {error && <p className="error-text" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && <p className="success-text" style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}

            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p style={{ textAlign: 'center' }}>No sessions found.</p>
            ) : (
              <div className="table-responsive"> {/* Add a responsive container for the table */}
                <table className="admin-table" data-aos="fade-up" data-aos-delay="100">
                  <thead>
                    <tr>
                      <th>Date & Time</th> {/* Combined for clarity */}
                      <th>Mentee Name</th>
                      <th>Mentee Email</th>
                      <th>Status</th>
                      <th>Mentee Feedback</th> {/* Added based on PRD */}
                      <th>Mentee Rating</th> {/* Added based on PRD */}
                      <th>My Notes/Feedback</th> {/* Added for mentor's own notes/feedback */}
                      <th>Actions</th> {/* New column for mentor actions */}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session._id}>
                        <td>{new Date(session.date).toLocaleString()}</td>
                        <td>{session.mentee.fullName || 'N/A'}</td>
                        <td>{session.mentee.email || 'N/A'}</td>
                        <td>{session.status || 'N/A'}</td>
                        <td>{session.menteeFeedback || "—"}</td>
                        <td>{session.menteeRating !== undefined ? `${session.menteeRating} / 5` : "—"}</td>
                        <td>{session.mentorFeedback || session.notes || "—"}</td>
                        <td className="table-actions"> {/* Use table-actions for button grouping */}
                          {/* Button for mentor to leave/edit feedback */}
                          {session.status === "COMPLETED" && ( // Assuming feedback is for completed sessions
                            <button
                              className="secondary-btn small-btn"
                              onClick={() => handleOpenMentorFeedbackModal(session)}
                            >
                              {session.mentorFeedback ? "Edit Feedback" : "Leave Feedback"}
                            </button>
                          )}
                          {/* Button for mentor to mark as completed */}
                          {session.status === "SCHEDULED" && (
                            <button
                              className="primary-btn small-btn"
                              onClick={() => handleMarkCompleted(session._id)}
                              disabled={markingCompletedId === session._id}
                            >
                              {markingCompletedId === session._id ? "Marking..." : "Mark as Completed"}
                            </button>
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

      {/* Mentor Feedback Modal */}
      {showMentorFeedbackModal && selectedSessionForMentorFeedback && (
        <div className="modal-overlay">
          <div className="modal-content" data-aos="zoom-in">
            <h3>Your Feedback for Session with {selectedSessionForMentorFeedback.mentee.fullName}</h3>
            <p>On: {new Date(selectedSessionForMentorFeedback.date).toLocaleString()}</p>
            <form onSubmit={handleSubmitMentorFeedback}>
              <div className="form-group">
                <label htmlFor="mentor-feedback-comment">Your Comments:</label>
                <textarea
                  id="mentor-feedback-comment"
                  rows={4}
                  value={mentorFeedbackText}
                  onChange={(e) => setMentorFeedbackText(e.target.value)}
                  placeholder="Leave your optional comments about this session..."
                  aria-label="Mentor Feedback Comment"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={isSubmittingMentorFeedback}>
                  {isSubmittingMentorFeedback ? "Saving..." : "Save Feedback"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowMentorFeedbackModal(false)}
                  disabled={isSubmittingMentorFeedback}
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

export default Sessions;

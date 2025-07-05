// src/features/mentee/MenteeRequests.tsx
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../../components/Navbar"; // Verify path
import Footer from "../../components/Footer"; // Verify path
import "../../styles/styles.css"; // Verify path
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

// Interface for a user object (mentor) as populated in Request
interface UserInRequest {
  _id: string;
  fullName: string;
  email: string;
}

// Interface for a single mentorship request, from the mentee's perspective
interface Request {
  _id: string;
  mentor: UserInRequest; // Populated mentor details
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string; // Date when the request was sent
}

const MenteeRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
    fetchSentRequests(); // Fetch mentee's sent requests on component mount
  }, []);

  // Function to fetch all requests sent by the authenticated mentee
  const fetchSentRequests = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /api/requests/sent - Mentees view requests they have sent
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/requests/sent`, {
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
          throw new Error(errorData.error || "Forbidden. You don’t have access to view these requests.");
        } else {
          throw new Error(errorData.error || "Failed to fetch your sent requests.");
        }
      }

      const data = await response.json();
      // Assuming backend returns an object like { requests: [...] } or an array directly
      setRequests(data.requests || []); // Adjust based on your backend's actual response structure
    } catch (err: any) {
      console.error("Fetch sent requests error:", err);
      setError(err.message || "An unexpected error occurred while fetching your sent requests.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle booking a session
  const handleBookSession = (mentor: UserInRequest) => {
    // Navigate to the BookSession page, passing the mentor object in state
    navigate("/mentee/book-session", { state: { mentor } });
  };

  return (
    <>
      <Navbar />
      <main className="mentee-requests-page">
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title" data-aos="fade-up">My Sent Mentorship Requests</h2>

            {error && <p className="error-text" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading your sent requests...</p>
            ) : requests.length === 0 ? (
              <p style={{ textAlign: 'center' }}>You haven't sent any mentorship requests yet. Browse mentors to get started!</p>
            ) : (
              <div className="requests-grid"> {/* Use a grid for cards or a responsive table */}
                {requests.map((req) => (
                  <div className="request-card" key={req._id} data-aos="fade-up">
                    <h3>Request to: {req.mentor.fullName}</h3>
                    <p><strong>Mentor Email:</strong> {req.mentor.email}</p>
                    <p><strong>Your Message:</strong> {req.message}</p>
                    <p><strong>Status:</strong> <span className={`status-${req.status.toLowerCase()}`}>{req.status}</span></p>
                    <p><strong>Sent On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                    {/* Add Book Session button if request is ACCEPTED */}
                    {req.status === "ACCEPTED" && (
                      <button
                        className="primary-btn small-btn"
                        onClick={() => handleBookSession(req.mentor)}
                      >
                        Book Session
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MenteeRequests;

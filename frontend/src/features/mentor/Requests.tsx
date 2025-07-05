// src/features/mentor/Requests.tsx
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

interface Request {
  _id: string;
  menteeName: string;
  menteeEmail: string;
  skills: string[];
  goals: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching requests
  const [error, setError] = useState(""); // State for displaying errors
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null); // State to disable buttons during update

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
    fetchRequests(); // Fetch requests when the component mounts
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /requests/received - View the requests the mentor has received
      // The backend will identify the mentor from the JWT in the Authorization header.
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/requests/received`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT for authentication
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific HTTP error codes
        if (response.status === 401) {
            throw new Error(errorData.error || "Unauthorized. Please log in again.");
        } else if (response.status === 403) {
            throw new Error(errorData.error || "Forbidden. You don’t have access to this page.");
        } else {
            throw new Error(errorData.error || "Failed to fetch requests.");
        }
      }

      const data = await response.json();
      // Assuming backend returns an object like { requests: [...] } or an array directly
      setRequests(data.requests || data || []);
    } catch (err: any) {
      console.error("❌ Fetch requests error:", err);
      setError(err.message || "Failed to load requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: "ACCEPTED" | "REJECTED") => {
    setError(""); // Clear previous errors
    setUpdatingRequestId(requestId); // Set ID to disable buttons for this request

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setUpdatingRequestId(null);
      return;
    }

    try {
      // PRD: PUT /requests/:id Mentor updates status (ACCEPTED/REJECTED)
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT for authentication
        },
        body: JSON.stringify({ status: action }), // Send the new status
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Failed to update request.");
      }

      // If successful, refresh the list to show updated status
      fetchRequests();
      console.log(`Request ${requestId} ${action} successfully.`);
    } catch (err: any) {
      console.error("❌ Update request error:", err);
      setError(err.message || "Server error updating request. Please try again later.");
    } finally {
      setUpdatingRequestId(null); // Reset updating state
    }
  };

  return (
    <>
      <Navbar />
      <main className="section-padding container">
        <h2 data-aos="fade-down">📬 Incoming Mentorship Requests</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: "center" }}>No mentorship requests received yet.</p>
        ) : (
          <div className="requests-grid">
            {requests.map((req) => (
              <div className="request-card" key={req._id} data-aos="fade-up">
                <h3>{req.menteeName}</h3>
                <p><strong>Email:</strong> {req.menteeEmail}</p>
                <p><strong>Skills:</strong> {req.skills.join(", ")}</p>
                <p><strong>Goals:</strong> {req.goals}</p>
                <p><strong>Status:</strong> <span className={`status-${req.status.toLowerCase()}`}>{req.status}</span></p> {/* Dynamic status styling */}
                {req.status === "PENDING" && (
                  <div className="action-buttons">
                    <button
                      className="accept-btn"
                      onClick={() => handleAction(req._id, "ACCEPTED")}
                      disabled={updatingRequestId === req._id} // Disable while updating
                    >
                      {updatingRequestId === req._id ? "Processing..." : "✅ Accept"}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleAction(req._id, "REJECTED")}
                      disabled={updatingRequestId === req._id} // Disable while updating
                    >
                      {updatingRequestId === req._id ? "Processing..." : "❌ Reject"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Requests;

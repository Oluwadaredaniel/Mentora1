// src/features/mentee/BookSession.tsx
import React, { useEffect, useState } from "react";
// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Verify path
import Footer from "../../components/Footer"; // Verify path
import "../../styles/styles.css"; // Verify path

// Interface for Mentor, as received from the BrowseMentors page's state
interface Mentor {
  _id: string;
  fullName: string;
  email: string;
  bio?: string;
  skills?: string[];
  goals?: string[];
  availability?: Array<{ // Mentor's availability blocks
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

// Interface for a session slot that a mentee can pick
interface SessionSlot {
  day: string;
  startTime: string;
  endTime: string;
  date: string; // The full date for the specific session
}

const BookSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true); // Loading for fetching mentor profile
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(""); // Date picked by mentee
  const [selectedSlot, setSelectedSlot] = useState<SessionSlot | null>(null); // Specific slot picked by mentee
  const [bookingLoading, setBookingLoading] = useState(false); // Loading for booking action

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Get mentor ID from location state or URL params (if coming directly from URL)
  const mentorIdFromState = (location.state as { mentor: Mentor } | null)?.mentor?._id;
  const mentorIdFromUrl = new URLSearchParams(location.search).get('mentorId');
  const mentorId = mentorIdFromState || mentorIdFromUrl;

  useEffect(() => {
    // Removed AOS initialization
    // AOS.init({ duration: 800, once: true });
    if (mentorId) {
      fetchMentorProfile(mentorId);
    } else {
      setError("No mentor selected. Please go back and select a mentor.");
      setLoading(false);
      // Optionally redirect if no mentor ID is found
      // navigate("/mentee/browse", { replace: true });
    }
  }, [mentorId, navigate]);

  const fetchMentorProfile = async (id: string) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /api/mentors/:id - Fetch a single mentor's profile by ID (including availability)
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/mentors/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch mentor profile.");
      }

      const data: Mentor = await response.json();
      setMentor(data);
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("Fetch mentor profile error:", err);
      setError((err instanceof Error ? err.message : "An unexpected error occurred") || "An unexpected error occurred while fetching mentor details.");
    } finally {
      setLoading(false);
    }
  };

  // Generate potential session dates based on mentor's availability
  const getAvailableSessionDates = (availability: Array<{ day: string; startTime: string; endTime: string }>) => {
    const today = new Date();
    const next30Days = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    const availableDates: { date: Date; slots: SessionSlot[] }[] = [];

    next30Days.forEach(date => {
      const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
      const matchingAvailability = availability.filter(slot => slot.day === dayOfWeek);

      if (matchingAvailability.length > 0) {
        const slotsForDate: SessionSlot[] = matchingAvailability.map(avail => ({
          day: avail.day,
          startTime: avail.startTime,
          endTime: avail.endTime,
          date: date.toISOString().split('T')[0] // Store as YYYY-MM-DD string
        }));
        availableDates.push({ date, slots: slotsForDate });
      }
    });
    return availableDates;
  };

  const availableDates = mentor?.availability ? getAvailableSessionDates(mentor.availability) : [];

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null); // Reset selected slot when date changes
  };

  const handleSlotSelection = (slot: SessionSlot) => {
    setSelectedSlot(slot);
  };

  const handleBookSession = async () => {
    setError("");
    setSuccessMessage("");
    setBookingLoading(true);

    if (!selectedSlot || !mentor || !mentor._id) {
      setError("Please select a valid session slot and ensure mentor details are loaded.");
      setBookingLoading(false);
      return;
    }

    const token = localStorage.getItem("mentoraUserToken");
    const menteeId = localStorage.getItem("mentoraUserId"); // Assuming mentee ID is stored on login

    if (!token || !menteeId) {
      setError("Authentication required. Please log in as a mentee.");
      setBookingLoading(false);
      return;
    }

    // Combine selected date and time to form a full ISO date string for the backend
    const sessionDateTime = new Date(`${selectedSlot.date}T${selectedSlot.startTime}:00`);

    try {
      // PRD: Mentees choose a slot and book a session.
      // Assuming POST /api/sessions for booking, with menteeId, mentorId, and date
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          menteeId: menteeId,
          mentorId: mentor._id,
          date: sessionDateTime.toISOString(), // Send ISO string for backend Date parsing
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to book session.");
      }

      setSuccessMessage("Session booked successfully! You can view it in 'My Sessions'.");
      setSelectedDate(""); // Clear form
      setSelectedSlot(null);
      // Optionally, navigate to "My Sessions" page after successful booking
      setTimeout(() => {
        navigate("/mentee/sessions");
      }, 2000);
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("Book session error:", err);
      setError((err instanceof Error ? err.message : "An unexpected error occurred") || "An unexpected error occurred while booking the session.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="book-session-page section-padding container">
          <p style={{ textAlign: "center" }}>Loading mentor details...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !mentor) { // Show error if mentor data couldn't be loaded at all
    return (
      <>
        <Navbar />
        <main className="book-session-page section-padding container">
          <p className="error-text" style={{ textAlign: "center" }}>{error}</p>
          <div style={{textAlign: 'center', marginTop: '1rem'}}>
            <button className="primary-btn" onClick={() => navigate("/mentee/browse")}>
              Back to Browse Mentors
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="book-session-page">
        <section className="hero-section">
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h2 className="section-title">Book a Session with {mentor?.fullName}</h2>
            <p>Select an available date and time slot to book your mentorship session.</p>
          </div>
        </section>

        <section className="section-padding container">
          {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}
          {successMessage && <p className="success-text" style={{ textAlign: 'center' }}>{successMessage}</p>}

          <div className="mentor-details-card"> {/* Removed data-aos attribute */}
            <h3>Mentor Profile:</h3>
            <p><strong>Name:</strong> {mentor?.fullName}</p>
            <p><strong>Email:</strong> {mentor?.email}</p>
            <p><strong>Bio:</strong> {mentor?.bio || "No bio provided."}</p>
            {mentor?.skills && mentor.skills.length > 0 && (
              <p><strong>Skills:</strong> {mentor.skills.join(", ")}</p>
            )}
            {mentor?.goals && mentor.goals.length > 0 && (
              <p><strong>Goals:</strong> {mentor.goals.join(", ")}</p>
            )}
          </div>

          <div className="booking-section"> {/* Removed data-aos attribute */}
            <h3>Choose a Session Slot</h3>

            {mentor?.availability && mentor.availability.length === 0 ? (
              <p style={{ textAlign: 'center' }}>This mentor has not set their availability yet. Please check back later!</p>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="select-date">Select Date:</label>
                  <select id="select-date" value={selectedDate} onChange={handleDateChange} aria-label="Select Session Date">
                    <option value="">-- Select a Date --</option>
                    {availableDates.map((dateObj, index) => (
                      <option key={index} value={dateObj.date.toISOString().split('T')[0]}>
                        {dateObj.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div className="available-slots">
                    <h4>Available Times for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:</h4>
                    <div className="slot-buttons">
                      {availableDates.find(d => d.date.toISOString().split('T')[0] === selectedDate)?.slots.map((slot, index) => (
                        <button
                          key={index}
                          className={`slot-btn ${selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`} // Corrected key and selection logic
                          onClick={() => handleSlotSelection(slot)}
                          disabled={bookingLoading}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSlot && (
                  <div className="selected-slot-summary"> {/* Removed data-aos attribute */}
                    <h4>Selected Slot:</h4>
                    <p>
                      {selectedSlot.day}, {new Date(selectedSlot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {" "}from {selectedSlot.startTime} to {selectedSlot.endTime}
                    </p>
                    <button
                      className="primary-btn"
                      onClick={handleBookSession}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Booking Session..." : "Confirm & Book Session"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BookSession;

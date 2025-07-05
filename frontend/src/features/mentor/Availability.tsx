import React, { useEffect, useState } from "react"; // Corrected syntax: 'from' instead of '=>'
import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
import "aos/dist/aos.css"; // Ensure AOS styles are available
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Helper function to generate time options for dropdowns (e.g., "09:00", "09:30")
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
      const h = String(hour).padStart(2, '0');
      const m = String(minute).padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

const Availability: React.FC = () => {
  const [slot, setSlot] = useState<AvailabilitySlot>({
    day: "Monday",
    startTime: "",
    endTime: "",
  });

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching existing availability
  const [saving, setSaving] = useState(false); // Loading state for saving new availability
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
    fetchExistingAvailability(); // Fetch existing availability on component mount
  }, []);

  // Function to fetch existing availability from the backend
  const fetchExistingAvailability = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mentors/availability`, { // Using API_BASE_URL
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch availability: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data.availability)) {
        setSlots(data.availability);
      } else {
        console.warn("Unexpected availability data format:", data);
        setSlots([]); // Default to empty if format is unexpected
      }
    } catch (err: any) {
      console.error("Fetch availability error:", err);
      setError(err.message || "Failed to load your availability.");
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => { // Changed type to HTMLSelectElement
    const { name, value } = e.target;
    setSlot({ ...slot, [name]: value });
  };

  const addSlot = () => {
    setError(""); // Clear errors before adding
    setSuccessMessage(""); // Clear success message

    if (!slot.startTime || !slot.endTime) {
      setError("Please select both start and end time.");
      return;
    }

    // Validation for end time > start time
    const start = slot.startTime;
    const end = slot.endTime;
    if (start >= end) {
      setError("End time must be after start time.");
      return;
    }

    setSlots((prevSlots) => [...prevSlots, slot]);
    setSlot({ day: "Monday", startTime: "", endTime: "" }); // Reset form
  };

  const removeSlot = (index: number) => {
    setSlots((prevSlots) => prevSlots.filter((_, i) => i !== index));
    setError(""); // Clear errors
    setSuccessMessage(""); // Clear success message
  };

  const handleSave = async () => {
    setError(""); // Clear errors before saving
    setSuccessMessage(""); // Clear success message
    setSaving(true); // Start saving loading state

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setSaving(false);
      return;
    }

    // Validate all existing slots before saving
    for (const s of slots) {
      if (!s.day || !s.startTime || !s.endTime) {
        setError("All availability slots must have a day, start time, and end time.");
        setSaving(false);
        return;
      }
      if (s.startTime >= s.endTime) {
        setError(`For ${s.day}, end time (${s.endTime}) must be after start time (${s.startTime}).`);
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mentors/availability`, { // Using API_BASE_URL
        method: "PUT", // PRD specifies PUT for updating availability
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT for authentication
        },
        body: JSON.stringify({ availability: slots }), // Send the array of slots as 'availability'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save availability.");
      } else {
        setSuccessMessage("Availability saved successfully!");
        console.log("Availability saved:", data);
      }
    } catch (err: any) {
      console.error("Save availability error:", err);
      setError(err.message || "Server error. Please try again later.");
    } finally {
      setSaving(false); // End saving loading state
    }
  };

  return (
    <>
      <Navbar />
      <main className="availability-page">
        <section className="section-padding container" data-aos="fade-up">
          <h2>Set Your Weekly Availability</h2>

          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          {successMessage && <p style={{ color: "green", textAlign: "center" }}>{successMessage}</p>}

          <div className="availability-form">
            <select name="day" value={slot.day} onChange={handleChange} aria-label="Select Day">
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              name="startTime"
              value={slot.startTime}
              onChange={handleChange}
              required
              aria-label="Start Time"
            >
              <option value="">-- Select Start Time --</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <span style={{ fontWeight: "bold" }}>to</span>
            <select
              name="endTime"
              value={slot.endTime}
              onChange={handleChange}
              required
              aria-label="End Time"
            >
              <option value="">-- Select End Time --</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <button type="button" onClick={addSlot} disabled={saving}>
              Add Slot
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", marginTop: "1rem" }}>Loading existing availability...</p>
          ) : slots.length > 0 ? (
            <div className="availability-list" data-aos="fade-up">
              <h3>Your Current Availability Slots</h3>
              <ul>
                {slots.map((s, index) => (
                  <li key={index}>
                    {s.day}: {s.startTime} – {s.endTime}
                    <button type="button" onClick={() => removeSlot(index)} disabled={saving}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ textAlign: "center", marginTop: "1rem" }}>No availability slots added yet.</p>
          )}

          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Availability;

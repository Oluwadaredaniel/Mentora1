// src/pages/Profile.tsx
import React, { useEffect, useState } from "react"; // Fixed syntax here: 'from' instead of '=>'
// Removed: import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
// Removed: import "aos/dist/aos.css"; // Ensure AOS styles are available
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Adjusted path assuming Profile.tsx is directly under src/pages/
import Footer from "../components/Footer"; // Adjusted path assuming Profile.tsx is directly under src/pages/
import "../styles/styles.css"; // Adjusted path assuming Profile.tsx is directly under src/pages/

// Interface for User Profile based on the User Model Schema
interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "mentor" | "mentee";
  bio: string;
  skills: string[];
  goals: string[];
  availability?: Array<{ // Only for mentors
    day: string;
    startTime: string;
    endTime: string;
  }>;
  isProfileComplete: boolean;
}

// Predefined list of skills for selection, aligned with typical mentorship areas
const predefinedSkills = [
  "Software Development",
  "Product Design",
  "Web Design",
  "Cybersecurity",
  "Data Science",
  "Marketing",
  "Finance",
  "Career Development",
  "Leadership",
  "Communication",
  "Project Management",
  "Sales",
  "Human Resources",
  "Entrepreneurship",
  "UI/UX Design",
  "Mobile App Development",
  "Cloud Computing",
  "Artificial Intelligence",
  "Machine Learning",
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    skills: [] as string[],
    goals: [] as string[],
    // For mentors, availability
    availability: [] as Array<{ day: string; startTime: string; endTime: string }>,
  });
  const [loading, setLoading] = useState(true); // Loading for fetching profile
  const [submitting, setSubmitting] = useState(false); // Loading for submitting form
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


  useEffect(() => {
    // Removed: AOS.init({ duration: 800, once: true });
    fetchUserProfile();
  }, []);

  // Fetch the user's current profile data to pre-fill the form
  const fetchUserProfile = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /auth/me - Get the currently authenticated user
      const response = await fetch(`${API_BASE_URL}/auth/me`, { // Using API_BASE_URL
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user profile.");
      }

      const data: UserProfile = await response.json();
      setUserProfile(data); // Store full user profile
      setFormData({
        fullName: data.fullName,
        bio: data.bio || "",
        skills: data.skills || [],
        goals: data.goals || [],
        // Conditional set for availability if user is a mentor
        availability: data.role === "mentor" && data.availability ? data.availability : [],
      });
    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("Fetch user profile error:", err);
      setError((err instanceof Error ? err.message : "An unexpected error occurred") || "Failed to load your profile data.");
      // If fetching fails, redirect to login as profile is required.
      // navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Handle changes for text/textarea inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle changes for skill checkboxes
  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const updatedSkills = checked
        ? [...prevData.skills, value]
        : prevData.skills.filter((skill) => skill !== value);
      return { ...prevData, skills: updatedSkills };
    });
  };

  // Handle changes for goal input (assuming comma-separated for simplicity)
  const handleGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const goalsString = e.target.value;
    const goalsArray = goalsString.split(',').map(goal => goal.trim()).filter(goal => goal !== '');
    setFormData((prevData) => ({ ...prevData, goals: goalsArray }));
  };

  // Handle changes for mentor availability slots (add/remove/update)
  const handleAvailabilityChange = (index: number, field: string, value: string) => {
    setFormData((prevData) => {
      const updatedAvailability = [...prevData.availability];
      updatedAvailability[index] = { ...updatedAvailability[index], [field]: value };
      return { ...prevData, availability: updatedAvailability };
    });
  };

  const addAvailabilitySlot = () => {
    setFormData((prevData) => ({
      ...prevData,
      availability: [...prevData.availability, { day: "Monday", startTime: "", endTime: "" }],
    }));
  };

  const removeAvailabilitySlot = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      availability: prevData.availability.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    // --- Client-side Validation (as per PRD) ---
    if (!formData.fullName.trim()) {
      setError("Full Name is required.");
      setSubmitting(false);
      return;
    }
    if (!formData.bio.trim()) {
      setError("A short bio is required to complete your profile.");
      setSubmitting(false);
      return;
    }
    if (formData.skills.length === 0) {
      setError("Please select at least one skill.");
      setSubmitting(false);
      return;
    }
    if (formData.goals.length === 0) {
      setError("Please state at least one goal.");
      setSubmitting(false);
      return;
    }

    // Mentor-specific availability validation
    if (userProfile?.role === "mentor") {
      if (formData.availability.length === 0) {
        setError("As a mentor, please set at least one availability slot.");
        setSubmitting(false);
        return;
      }
      for (const slot of formData.availability) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          setError("All availability slots must have a day, start time, and end time.");
          setSubmitting(false);
          return;
        }
        // Basic time validation (endTime > startTime)
        const start = new Date(`2000/01/01 ${slot.startTime}`);
        const end = new Date(`2000/01/01 ${slot.endTime}`);
        if (start >= end) {
            setError(`For ${slot.day}, end time (${slot.endTime}) must be after start time (${slot.startTime}).`);
            setSubmitting(false);
            return;
        }
      }
    }
    // --- End Client-side Validation ---

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication required. Please log in.");
      setSubmitting(false);
      return;
    }

    try {
      // PRD: PUT /users/me/profile Update own profile (bio, skills, goals)
      // The current backend route is POST /api/auth/profile in authRoutes.js
      // We will use that for now, but note the PRD suggests PUT /users/me/profile
      const response = await fetch(`${API_BASE_URL}/auth/profile`, { // Using API_BASE_URL
        method: "POST", // Using POST as per current auth-router-backend.js
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT for authentication
        },
        body: JSON.stringify(formData), // Send all form data
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update profile.");
      }

      setSuccessMessage("Profile updated successfully!");
      // Update local storage for full name if it changed
      localStorage.setItem("mentoraUserFullName", formData.fullName);

      // After successful update and profile completion, redirect to respective dashboard
      if (userProfile?.role === "admin") {
        navigate("/admin/AdminDashboard"); // Corrected path to AdminDashboard
      } else if (userProfile?.role === "mentor") {
        navigate("/mentor/dashboard");
      } else if (userProfile?.role === "mentee") {
        navigate("/mentee/dashboard");
      }

    } catch (err: unknown) { // Changed 'any' to 'unknown'
      console.error("Profile update error:", err);
      setError((err instanceof Error ? err.message : "An unexpected error occurred") || "An unexpected error occurred while saving your profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="profile-page section-padding container">
          <p style={{ textAlign: "center" }}>Loading profile...</p>
        </main>
        <Footer />
      </>
    );
  }

  // If userProfile is null after loading (e.g., failed to fetch), show error or redirect
  if (!userProfile) {
    return (
      <>
        <Navbar />
        <main className="profile-page section-padding container">
          <p className="error-text" style={{ textAlign: "center" }}>
            Failed to load profile. Please try logging in again.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="profile-page">
        <section className="hero-section">
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h2 className="section-title">Edit Your Profile</h2>
            <p>Complete your profile to get the most out of Mentora.</p>
          </div>
        </section>

        <section className="section-padding container">
          {error && <p className="error-text" style={{ textAlign: 'center' }}>{error}</p>}
          {successMessage && <p className="success-text" style={{ textAlign: 'center' }}>{successMessage}</p>}

          <form onSubmit={handleSubmit} className="profile-form"> {/* Removed data-aos attribute */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name:</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                aria-label="Full Name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Short Bio:</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself and your experience..."
                required
                aria-label="Short Bio"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Skills: (Select all that apply)</label>
              <div className="skills-checkbox-grid">
                {predefinedSkills.map((skill) => (
                  <label key={skill} className="checkbox-container">
                    <input
                      type="checkbox"
                      value={skill}
                      checked={formData.skills.includes(skill)}
                      onChange={handleSkillChange}
                    />
                    <span className="checkbox-label">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="goals">Goals: (Comma-separated, e.g., Improve product design skills, Learn public speaking)</label>
              <textarea
                id="goals"
                name="goals"
                rows={3}
                value={formData.goals.join(", ")} // Display as comma-separated string
                onChange={handleGoalsChange}
                placeholder="What are your goals? (e.g., Improve product design skills, Land a tech job)"
                required
                aria-label="Your Goals"
              ></textarea>
            </div>

            {/* Mentor-specific fields */}
            {userProfile.role === "mentor" && (
              <div className="mentor-specific-fields"> {/* Removed data-aos attribute */}
                <h3>Your Availability (Mentor Specific)</h3>
                <p>Set your weekly availability blocks for mentorship sessions.</p>
                {formData.availability.length === 0 && (
                  <p style={{textAlign: 'center', margin: '1rem 0'}}>No availability slots added yet. Click "Add Slot" to begin.</p>
                )}
                {formData.availability.map((slot, index) => (
                  <div key={index} className="availability-slot-row form-group">
                    <select
                      value={slot.day}
                      onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)}
                      required
                      aria-label={`Day for slot ${index + 1}`}
                    >
                      <option value="">Select Day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                      required
                      aria-label={`Start time for slot ${index + 1}`}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                      required
                      aria-label={`End time for slot ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeAvailabilitySlot(index)}
                      aria-label={`Remove slot ${index + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="secondary-btn" onClick={addAvailabilitySlot}>
                  Add Availability Slot
                </button>
              </div>
            )}

            <button type="submit" className="primary-btn submit-profile-btn" disabled={submitting}>
              {submitting ? "Saving Profile..." : "Save Profile"}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Profile;

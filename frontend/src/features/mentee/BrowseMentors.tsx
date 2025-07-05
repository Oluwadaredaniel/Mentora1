import React, { useEffect, useState } => "react";
import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
import "aos/dist/aos.css"; // Ensure AOS styles are available
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

// Updated Mentor interface to match the User model's structure for mentors
interface Mentor {
  _id: string;
  fullName: string;
  email: string;
  bio: string;
  skills: string[]; // Mentors have a 'skills' array, not a 'category' string
  goals?: string[]; // Optional goals field as per User model
  availability?: Array<{ // Optional availability for display, though full details might not be shown here
    day: string;
    startTime: string;
    endTime: string;
  }>;
}

const BrowseMentors: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching mentors
  const [error, setError] = useState(""); // Error state for display
  const navigate = useNavigate();

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Define categories (skills/interests) to filter mentors by.
  // These should ideally match the common skills/interests that mentors might have.
  const categories = [
    "Software Development",
    "Product Design",
    "Web Design",
    "Cybersecurity",
    "Data Science",
    "Marketing",
    "Finance",
    "Career Development",
    "Leadership",
    "Communication" // Added more examples
  ];

  useEffect(() => {
    AOS.init({ duration: 800, once: true }); // Initialize AOS with 'once: true'
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError(""); // Clear previous errors

    const token = localStorage.getItem("mentoraUserToken"); // Get JWT from local storage

    // Check if token exists, crucial for authenticated routes
    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // PRD: GET /api/mentors - Mentees can view a list of mentors
      // This endpoint is handled by mentorController.getAllMentors and is protected.
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/mentors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send the JWT in the Authorization header
        },
      });

      if (!response.ok) {
        const errorData = await response.json(); // Attempt to parse error message from backend
        // Handle specific HTTP error codes
        if (response.status === 401) {
          throw new Error(errorData.error || "Unauthorized. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(errorData.error || "Forbidden. You don’t have access to view mentors.");
        } else {
          throw new Error(errorData.error || "Failed to fetch mentors.");
        }
      }

      const data: Mentor[] = await response.json(); // Expect an array of Mentor objects
      setMentors(data);
    } catch (err: any) {
      console.error("Fetch mentors error:", err);
      setError(err.message || "An unexpected error occurred while fetching mentors.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render a section for a specific mentor category (skill)
  const renderCategorySection = (category: string) => {
    // Filter mentors who have this category/skill in their 'skills' array
    const filtered = mentors.filter((mentor) =>
      mentor.skills && mentor.skills.some(skill => skill.toLowerCase().includes(category.toLowerCase()))
      // Using .includes() for broader matching, e.g., "Full Stack" might match "Full Stack Development" skill
    );

    // Only render the section if there are mentors in this category
    if (filtered.length === 0) return null;

    return (
      <div className="mentor-category" key={category} data-aos="fade-up">
        <h3>{category} Mentors</h3> {/* Added 'Mentors' for clarity */}
        <div className="mentor-scroll">
          {filtered.map((mentor) => (
            <div className="mentor-card" key={mentor._id}>
              <h4>{mentor.fullName}</h4>
              <p><strong>Email:</strong> {mentor.email}</p>
              <p><strong>Bio:</strong> {mentor.bio || "No bio provided."}</p>
              {mentor.skills && mentor.skills.length > 0 && (
                <p><strong>Skills:</strong> {mentor.skills.join(", ")}</p>
              )}
              {mentor.goals && mentor.goals.length > 0 && (
                <p><strong>Goals:</strong> {mentor.goals.join(", ")}</p>
              )}
              <button
                className="primary-btn"
                // Changed navigation to the BookSession component
                onClick={() => navigate("/mentee/book-session", { state: { mentor } })}
                aria-label={`Book session with ${mentor.fullName}`} // Accessibility
              >
                Book Session
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar /> {/* Navbar component included */}
      <main className="browse-mentors-page">
        <section className="hero-section"> {/* Optional hero section for design */}
          <div className="hero-content" data-aos="fade-down">
            <h2 className="section-title">Browse Mentors</h2>
            <p>Choose a mentor based on your interest area and skills.</p>
          </div>
        </section>

        <section className="section-padding container">
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading mentors...</p>
          ) : mentors.length === 0 ? (
            <p style={{ textAlign: "center" }}>No mentors found at the moment. Please check back later!</p>
          ) : (
            <>
              {/* Render sections for predefined categories/skills */}
              {categories.map((cat) => renderCategorySection(cat))}

              {/* Optional: Render any mentors that don't fit into the above categories, or a general "All Mentors" list */}
              {/* This block can be uncommented if you want to display all mentors regardless of their primary categories/skills */}
              {/*
              <div className="mentor-category" data-aos="fade-up" style={{ marginTop: '3rem' }}>
                <h3>All Available Mentors</h3>
                <div className="mentor-scroll">
                  {mentors.map((mentor) => (
                    <div className="mentor-card" key={mentor._id}>
                      <h4>{mentor.fullName}</h4>
                      <p><strong>Email:</strong> {mentor.email}</p>
                      <p><strong>Bio:</strong> {mentor.bio || "No bio provided."}</p>
                      <p><strong>Skills:</strong> {mentor.skills.join(", ")}</p>
                      <p><strong>Goals:</strong> {mentor.goals.join(", ")}</p>
                      <button
                        className="primary-btn"
                        onClick={() => navigate("/mentee/book-session", { state: { mentor } })}
                        aria-label={`Book session with ${mentor.fullName}`}
                      >
                        Book Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              */}
            </>
          )}
        </section>
      </main>
      <Footer /> {/* Footer component included */}
    </>
  );
};

export default BrowseMentors;

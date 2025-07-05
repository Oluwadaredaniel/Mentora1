// src/features/mentor/Dashboard.tsx
import React, { useEffect } from "react";
// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

const MentorDashboard: React.FC = () => {
  useEffect(() => {
    // Removed AOS initialization
    // AOS.init({
    //   once: true, // Only animate once
    // });
  }, []);

  return (
    <>
      <Navbar />
      <main className="mentor-dashboard-page">
        <section className="hero-section mentor-hero">
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h1>Welcome, Mentor 👋</h1>
            <p>Manage your availability, respond to requests, and track your sessions here.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mentor-grid">
            <Link to="/mentor/availability" className="mentor-card"> {/* Removed data-aos attribute */}
              <h3>📆 Set Availability</h3>
              <p>Define when you’re available to mentor.</p>
            </Link>
            <Link to="/mentor/requests" className="mentor-card"> {/* Removed data-aos attribute */}
              <h3>📥 Mentorship Requests</h3>
              <p>Accept or reject requests from mentees.</p>
            </Link>
            <Link to="/mentor/sessions" className="mentor-card"> {/* Removed data-aos attribute */}
              <h3>📚 Your Sessions</h3>
              <p>View your upcoming and past mentorship sessions.</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default MentorDashboard;

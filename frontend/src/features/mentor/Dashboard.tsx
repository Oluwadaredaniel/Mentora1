// src/features/mentor/Dashboard.tsx
import React, { useEffect } from "react";
import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
import "aos/dist/aos.css"; // Ensure AOS styles are available
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

const MentorDashboard: React.FC = () => {
  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="mentor-dashboard-page">
        <section className="hero-section mentor-hero">
          <div className="hero-content" data-aos="fade-up" data-aos-duration="1000">
            <h1>Welcome, Mentor 👋</h1>
            <p>Manage your availability, respond to requests, and track your sessions here.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mentor-grid">
            <Link to="/mentor/availability" className="mentor-card" data-aos="fade-up" data-aos-delay="100">
              <h3>📆 Set Availability</h3>
              <p>Define when you’re available to mentor.</p>
            </Link>
            <Link to="/mentor/requests" className="mentor-card" data-aos="fade-up" data-aos-delay="200">
              <h3>📥 Mentorship Requests</h3>
              <p>Accept or reject requests from mentees.</p>
            </Link>
            <Link to="/mentor/sessions" className="mentor-card" data-aos="fade-up" data-aos-delay="300">
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

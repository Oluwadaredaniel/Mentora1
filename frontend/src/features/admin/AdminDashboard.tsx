// src/features/admin/AdminDashboard.tsx
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/styles.css";

const AdminDashboard: React.FC = () => {
  useEffect(() => {
    AOS.init({
      once: true, // Consistent with other components for single animation
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="admin-dashboard-page">
        <section className="hero-section admin-hero">
          <div className="hero-content" data-aos="fade-up" data-aos-duration="1000">
            <h1>Welcome, Admin</h1>
            <p>Manage users, matches, and sessions from your control panel.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container admin-grid">
            <Link to="/admin/AllUsers" className="admin-card" data-aos="fade-up" data-aos-delay="100">
              <h3>👥 All Users</h3>
              <p>View and manage registered mentors and mentees.</p>
            </Link>
            <Link to="/admin/AllMatches" className="admin-card" data-aos="fade-up" data-aos-delay="200">
              <h3>🤝 Mentorship Matches</h3>
              <p>Review and assign mentorship connections.</p>
            </Link>
            <Link to="/admin/AllSessions" className="admin-card" data-aos="fade-up" data-aos-delay="300">
              <h3>📅 Sessions</h3>
              <p>View all scheduled and completed mentorship sessions.</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;

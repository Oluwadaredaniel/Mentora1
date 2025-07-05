// src/features/mentee/Dashboard.tsx
import React, { useEffect, useState } from "react";
// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Retaining original path. Please verify this path matches your project structure.
import Footer from "../../components/Footer"; // Retaining original path. Please verify this path matches your project structure.
import "../../styles/styles.css"; // Retaining original path. Please verify this path matches your project structure.

const MenteeDashboard: React.FC = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Removed AOS initialization
    // AOS.init({ duration: 800, once: true });
    // Retrieve the full name from local storage. It's generally better to store 'fullName' after login.
    const name = localStorage.getItem("mentoraUserFullName") || "Mentee"; // Assuming 'mentoraUserFullName' is stored on login
    setUserName(name);
  }, []);

  return (
    <>
      {/* Navbar component included */}
      <Navbar />
      <main className="mentee-dashboard-page"> {/* Consistent main tag for styling */}
        <section className="hero-section mentee-hero"> {/* Applying hero section styles */}
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h2>Welcome back, {userName} 👋</h2>
            <p>Your journey to growth continues here!</p>
          </div>
        </section>

        <section className="section-padding"> {/* Consistent section padding */}
          <div className="container dashboard-grid"> {/* Removed data-aos attribute */}
            <div
              className="dashboard-card"
              onClick={() => navigate("/mentee/browse")}
              role="button" // Improve accessibility
              tabIndex={0} // Make keyboard focusable
              onKeyDown={(e) => { // Handle keyboard navigation
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate("/mentee/browse");
                }
              }}
            >
              <h3>Browse Mentors</h3>
              <p>Explore mentors by skill and interest</p>
            </div>

            <div
              className="dashboard-card"
              onClick={() => navigate("/mentee/requests")}
              role="button" // Improve accessibility
              tabIndex={0} // Make keyboard focusable
              onKeyDown={(e) => { // Handle keyboard navigation
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate("/mentee/requests");
                }
              }}
            >
              <h3>My Requests</h3>
              <p>View pending and accepted requests</p>
            </div>

            <div
              className="dashboard-card"
              onClick={() => navigate("/mentee/sessions")}
              role="button" // Improve accessibility
              tabIndex={0} // Make keyboard focusable
              onKeyDown={(e) => { // Handle keyboard navigation
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate("/mentee/sessions");
                }
              }}
            >
              <h3>Session History</h3>
              <p>Track completed mentorship sessions</p>
            </div>
          </div>
        </section>
      </main>
      {/* Footer component included */}
      <Footer />
    </>
  );
};

export default MenteeDashboard;

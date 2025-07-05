// src/features/admin/AdminDashboard.tsx
import React from "react"; // Removed useEffect from import
// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; // Verify path
import Footer from "../../components/Footer"; // Verify path
import "../../styles/styles.css"; // Verify path

const AdminDashboard: React.FC = () => {
  // Removed useEffect hook as it's no longer needed after removing AOS
  // useEffect(() => {
  //   AOS.init({
  //     once: true, // Only animate once
  //   });
  // }, []);

  return (
    <>
      <Navbar />
      <main className="admin-dashboard-page">
        <section className="hero-section admin-hero">
          <div className="hero-content"> {/* Removed data-aos attribute */}
            <h1>Admin Dashboard</h1>
            <p>Manage users, content, and system settings.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container admin-grid">
            <Link to="/admin/users" className="admin-card"> {/* Removed data-aos attribute */}
              <h3>👥 Manage Users</h3>
              <p>View, create, update, and delete user accounts.</p>
            </Link>
            <Link to="/admin/content" className="admin-card"> {/* Removed data-aos attribute */}
              <h3>📝 Manage Content</h3>
              <p>Oversee articles, resources, and site content.</p>
            </Link>
            <Link to="/admin/settings" className="admin-card"> {/* Removed data-aos attribute */}
              <h3>⚙️ System Settings</h3>
              <p>Configure platform-wide settings and integrations.</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;

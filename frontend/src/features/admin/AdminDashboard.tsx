// src/features/admin/AdminDashboard.tsx

// Removed: import AOS from "aos";
// Removed: import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/styles.css";

const AdminDashboard: React.FC = () => {
  // Removed AOS initialization useEffect
  // useEffect(() => {
  //   AOS.init({
  //     once: true,
  //   });
  // }, []);

  return (
    <>
      <Navbar />
      <main className="admin-dashboard-page">
        <section className="hero-section admin-hero">
          <div className="hero-content"> {/* Removed data-aos attributes */}
            <h1>Welcome, Admin</h1>
            <p>Manage users, matches, and sessions from your control panel.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container admin-grid">
            <Link to="/admin/AllUsers" className="admin-card"> {/* Removed data-aos attributes */}
              <h3>👥 All Users</h3>
              <p>View and manage registered mentors and mentees.</p>
            </Link>
            <Link to="/admin/AllMatches" className="admin-card"> {/* Removed data-aos attributes */}
              <h3>🤝 Mentorship Matches</h3>
              <p>Review and assign mentorship connections.</p>
            </Link>
            <Link to="/admin/AllSessions" className="admin-card"> {/* Removed data-aos attributes */}
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

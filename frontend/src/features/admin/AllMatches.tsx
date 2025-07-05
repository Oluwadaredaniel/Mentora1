import React, { useEffect, useState } from "react";
import AOS from "aos"; // Ensure AOS is installed (npm install aos or yarn add aos)
import "aos/dist/aos.css"; // Ensure AOS styles are available
import Navbar from "../../components/Navbar"; // Adjusted path
import Footer from "../../components/Footer"; // Adjusted path
import "../../styles/styles.css"; // Adjusted path

// Interface for User, as expected from the /api/admin/users endpoint
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string; // "admin", "mentor", "mentee"
}

// Interface for Match, as expected from the /api/admin/matches endpoint
interface Match {
  _id: string;
  mentor: User; // Assuming the mentor object is embedded
  mentee: User; // Assuming the mentee object is embedded
  createdAt: string; // Date string
}

const AllMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [mentees, setMentees] = useState<User[]>([]);
  const [mentorId, setMentorId] = useState("");
  const [menteeId, setMenteeId] = useState("");
  const [loading, setLoading] = useState(true); // Initial loading state for fetchData
  const [creatingMatch, setCreatingMatch] = useState(false); // Loading state for create match operation
  const [error, setError] = useState("");

  // --- API Base URL Declaration ---
  // It will read from VITE_API_BASE_URL environment variable (from frontend/.env or Vercel)
  // If the environment variable is not set (e.g., during local development without a .env),
  // it will fallback to "http://localhost:5000/api".
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


  useEffect(() => {
    AOS.init({
      once: true, // Only animate once
    });
    fetchData(); // Fetch users and matches when the component mounts
  }, []);

  // Function to fetch all users (for select dropdowns) and existing matches
  const fetchData = async () => {
    setLoading(true); // Start initial loading
    setError(""); // Clear previous errors

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch all users
      // --- API Call using API_BASE_URL ---
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authenticated endpoint
        },
      });

      if (!usersRes.ok) {
        const errorData = await usersRes.json();
        throw new Error(errorData.error || `Failed to fetch users: ${usersRes.statusText}`);
      }
      const allUsers: User[] = await usersRes.json();
      setMentors(allUsers.filter((user: User) => user.role === "mentor"));
      setMentees(allUsers.filter((user: User) => user.role === "mentee"));

      // 2. Fetch all matches
      // --- API Call using API_BASE_URL ---
      const matchesRes = await fetch(`${API_BASE_URL}/admin/matches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authenticated endpoint
        },
      });

      if (!matchesRes.ok) {
        const errorData = await matchesRes.json();
        throw new Error(errorData.error || `Failed to fetch matches: ${matchesRes.statusText}`);
      }
      const matchData: Match[] = await matchesRes.json();
      setMatches(matchData);

    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(err.message || "Failed to load users and matches.");
    } finally {
      setLoading(false); // End initial loading
    }
  };

  // Function to handle creating a new match manually
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setCreatingMatch(true); // Set loading state for match creation

    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setCreatingMatch(false);
      return;
    }

    if (!mentorId || !menteeId) {
        setError("Please select both a mentor and a mentee.");
        setCreatingMatch(false);
        return;
    }

    try {
      // PRD implies POST /admin/matches for manually assigning.
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/admin/matches`, {
        method: "POST", // Method for creating a new resource
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authenticated endpoint
        },
        body: JSON.stringify({ mentorId, menteeId }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Use backend's error message, or a default one
        throw new Error(data.error || data.message || "Error creating match.");
      }

      setMentorId(""); // Clear form fields
      setMenteeId("");
      fetchData(); // Reload matches list to show the new match
      console.log("Match created successfully:", data);
      // Optionally, display a success message
    } catch (err: any) {
      console.error("Error creating match:", err);
      setError(err.message || "Failed to create match.");
    } finally {
      setCreatingMatch(false); // End loading state for match creation
    }
  };

  return (
    <>
      <Navbar />
      <main className="admin-dashboard-page">
        <section className="section-padding" data-aos="fade-up">
          <div className="container">
            <h2 className="section-title">🤝 All Mentorship Matches</h2>
            <p>View and manually assign mentor-mentee connections.</p>

            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

            <h3>Manually Assign Match</h3>
            <form onSubmit={handleCreateMatch} className="admin-form">
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                required
                aria-label="Select Mentor"
              >
                <option value="">Select Mentor</option>
                {mentors.length === 0 ? (
                    <option disabled>No mentors available</option>
                ) : (
                    mentors.map((mentor) => (
                        <option key={mentor._id} value={mentor._id}>
                            {mentor.fullName} ({mentor.email})
                        </option>
                    ))
                )}
              </select>

              <select
                value={menteeId}
                onChange={(e) => setMenteeId(e.target.value)}
                required
                aria-label="Select Mentee"
              >
                <option value="">Select Mentee</option>
                {mentees.length === 0 ? (
                    <option disabled>No mentees available</option>
                ) : (
                    mentees.map((mentee) => (
                        <option key={mentee._id} value={mentee._id}>
                            {mentee.fullName} ({mentee.email})
                        </option>
                    ))
                )}
              </select>

              <button type="submit" disabled={creatingMatch}>
                {creatingMatch ? "Creating..." : "Create Match"}
              </button>
            </form>

            <h3 style={{marginTop: '2rem'}}>Existing Matches</h3>
            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading matches...</p>
            ) : matches.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No matches found.</p>
            ) : (
                <div className="table-responsive"> {/* Add responsive container */}
                    <table className="admin-table" data-aos="fade-up" data-aos-delay="200">
                        <thead>
                            <tr>
                                <th>Mentor</th>
                                <th>Mentee</th>
                                <th>Date Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map((match) => (
                                <tr key={match._id}>
                                    <td>{match.mentor?.fullName || 'N/A'}</td> {/* Handle potential missing mentor data */}
                                    <td>{match.mentee?.fullName || 'N/A'}</td> {/* Handle potential missing mentee data */}
                                    <td>{new Date(match.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AllMatches;

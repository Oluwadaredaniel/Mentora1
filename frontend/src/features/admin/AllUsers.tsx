// src/features/admin/AllUsers.tsx
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../../components/Navbar"; // Verify path
import Footer from "../../components/Footer"; // Verify path
import "../../styles/styles.css"; // Verify path

// Interface for User Profile (simplified for table display)
interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "mentor" | "mentee";
  isProfileComplete: boolean;
  createdAt: string; // To show join date
}

const AllUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for Create User Modal
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "mentee", // Default role for new user
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // State for Edit Role Modal
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedUserForRoleEdit, setSelectedUserForRoleEdit] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "mentor" | "mentee">("mentee");
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const [editRoleError, setEditRoleError] = useState("");

  // State for Delete User Confirmation Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // --- API Base URL Declaration ---
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


  useEffect(() => {
    AOS.init({ once: true });
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("mentoraUserToken");

    if (!token) {
      setError("Authentication token not found. Please log in as an Admin.");
      setLoading(false);
      return;
    }

    try {
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users.");
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message || "An unexpected error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  // --- Create User by Admin Handlers ---
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    setSuccessMessage("");

    const token = localStorage.getItem("mentoraUserToken");
    if (!token) {
      setCreateError("Authentication token not found. Please log in.");
      setCreateLoading(false);
      return;
    }

    try {
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUserData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create user.");
      }

      setSuccessMessage("User created successfully!");
      setShowCreateUserModal(false);
      setNewUserData({ fullName: "", email: "", password: "", role: "mentee" }); // Reset form
      fetchAllUsers(); // Refresh the user list
    } catch (err: any) {
      console.error("Create user error:", err);
      setCreateError(err.message || "An unexpected error occurred during user creation.");
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Edit Role Handlers ---
  const handleOpenEditRoleModal = (user: User) => {
    setSelectedUserForRoleEdit(user);
    setNewRole(user.role); // Set current role as default
    setShowEditRoleModal(true);
    setEditRoleError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear general success messages
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewRole(e.target.value as "admin" | "mentor" | "mentee");
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditRoleLoading(true);
    setEditRoleError("");
    setSuccessMessage("");

    if (!selectedUserForRoleEdit) {
      setEditRoleError("No user selected for role update.");
      setEditRoleLoading(false);
      return;
    }

    const token = localStorage.getItem("mentoraUserToken");
    if (!token) {
      setEditRoleError("Authentication token not found. Please log in.");
      setEditRoleLoading(false);
      return;
    }

    try {
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUserForRoleEdit._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update role.");
      }

      setSuccessMessage(`Role updated for ${selectedUserForRoleEdit.fullName} to ${newRole}!`);
      setShowEditRoleModal(false);
      setSelectedUserForRoleEdit(null); // Clear selected user
      fetchAllUsers(); // Refresh the user list
    } catch (err: any) {
      console.error("Update role error:", err);
      setEditRoleError(err.message || "An unexpected error occurred during role update.");
    } finally {
      setEditRoleLoading(false);
    }
  };

  // --- Delete User Handlers ---
  const handleOpenDeleteConfirmModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
    setDeleteError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear general success messages
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    setSuccessMessage("");

    if (!userToDelete) {
      setDeleteError("No user selected for deletion.");
      setDeleteLoading(false);
      return;
    }

    const token = localStorage.getItem("mentoraUserToken");
    if (!token) {
      setDeleteError("Authentication token not found. Please log in.");
      setDeleteLoading(false);
      return;
    }

    try {
      // --- API Call using API_BASE_URL ---
      const response = await fetch(`${API_BASE_URL}/admin/users/${userToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setSuccessMessage(`User ${userToDelete.fullName} deleted successfully!`);
      setShowDeleteConfirmModal(false);
      setUserToDelete(null); // Clear user to delete
      fetchAllUsers(); // Refresh the user list
    } catch (err: any) {
      console.error("Delete user error:", err);
      setDeleteError(err.message || "An unexpected error occurred during user deletion.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="admin-dashboard-page">
        <section className="section-padding">
          <div className="container">
            <h2 className="section-title" data-aos="fade-up">All Users Management</h2>
            <p className="section-description" data-aos="fade-up" data-aos-delay="50">
              Manage all user accounts, create new users, and update their roles.
            </p>

            <div className="admin-actions-bar" data-aos="fade-up" data-aos-delay="100">
              <button
                className="primary-btn"
                onClick={() => {
                  setShowCreateUserModal(true);
                  setCreateError(""); // Clear previous create errors
                  setSuccessMessage(""); // Clear general success messages
                }}
              >
                Create New User
              </button>
            </div>

            {error && <p className="error-text" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {successMessage && <p className="success-text" style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}

            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ textAlign: 'center' }}>No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table" data-aos="fade-up" data-aos-delay="150">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Profile Complete</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.isProfileComplete ? "Yes" : "No"}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="table-actions"> {/* Added a class for styling buttons */}
                          <button
                            className="secondary-btn small-btn"
                            onClick={() => handleOpenEditRoleModal(user)}
                          >
                            Edit Role
                          </button>
                          <button
                            className="danger-btn small-btn" // Added danger-btn for styling
                            onClick={() => handleOpenDeleteConfirmModal(user)}
                          >
                            Delete
                          </button>
                        </td>
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

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-user-modal-title">
          <div className="modal-content" data-aos="zoom-in">
            <h3 id="create-user-modal-title">Create New User</h3>
            {createError && <p className="error-text">{createError}</p>}
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="new-fullName">Full Name:</label>
                <input
                  type="text"
                  id="new-fullName"
                  name="fullName"
                  value={newUserData.fullName}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-email">Email:</label>
                <input
                  type="email"
                  id="new-email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">Password:</label>
                <input
                  type="password"
                  id="new-password"
                  name="password"
                  value={newUserData.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-role">Role:</label>
                <select
                  id="new-role"
                  name="role"
                  value={newUserData.role}
                  onChange={handleNewUserChange}
                  required
                >
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={createLoading}>
                  {createLoading ? "Creating..." : "Create User"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowCreateUserModal(false)}
                  disabled={createLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleModal && selectedUserForRoleEdit && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-role-modal-title">
          <div className="modal-content" data-aos="zoom-in">
            <h3 id="edit-role-modal-title">Edit Role for {selectedUserForRoleEdit.fullName}</h3>
            {editRoleError && <p className="error-text">{editRoleError}</p>}
            <form onSubmit={handleUpdateRole}>
              <div className="form-group">
                <label htmlFor="edit-role">New Role:</label>
                <select
                  id="edit-role"
                  name="role"
                  value={newRole}
                  onChange={handleRoleChange}
                  required
                >
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={editRoleLoading}>
                  {editRoleLoading ? "Updating..." : "Update Role"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowEditRoleModal(false)}
                  disabled={editRoleLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && userToDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-modal-title">
          <div className="modal-content" data-aos="zoom-in">
            <h3 id="delete-confirm-modal-title">Confirm Deletion</h3>
            {deleteError && <p className="error-text">{deleteError}</p>}
            <p>Are you sure you want to delete user: <strong>{userToDelete.fullName} ({userToDelete.email})</strong>?</p>
            <p className="danger-text">This action cannot be undone and will permanently remove the user account.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="danger-btn"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setShowDeleteConfirmModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllUsers;

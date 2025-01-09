import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Cookies from "js-cookie";
import "./index.css";
import axios from "axios";
import { baseUrl } from "../config";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import {jwtDecode} from "jwt-decode";

const Users = () => {
  const token = Cookies.get("jwtToken");
  let userRole = "user"; // Default role

  if (token) {
    const decodedToken = jwtDecode(token);
    userRole = decodedToken.role; // Extract the role from the decoded token
  }

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    password: "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}get-users`);
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Search functionality
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = users.filter((user) =>
      user.full_name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredUsers(filteredData);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Update user role to admin
  const makeAdmin = async (userId) => {
    try {
      const response = await axios.patch(`${baseUrl}users/${userId}/role`, {
        role: "admin",
      });

      if (response.data.success) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, role: "admin" } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        alert("User role updated successfully!");
      } else {
        console.error("Error updating role:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Remove admin role
  const removeAdmin = async (userId) => {
    try {
      const response = await axios.patch(`${baseUrl}users/${userId}/role`, {
        role: "user", // Change role back to 'user' or another default role
      });

      if (response.data.success) {
        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, role: "user" } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        alert("User role updated successfully!");
      } else {
        console.error("Error updating role:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  // Open the edit popup and set user details
  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setUserDetails({
      full_name: user.full_name || "",
      password: "",
    });
  };

  // Handle input changes in the edit form
  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Save changes to the user
  const handleSaveChanges = async (closePopup) => {
    try {
      const response = await axios.patch(`${baseUrl}users/${editingUser}`, userDetails);
      if (response.data.success) {
        const updatedUsers = users.map((user) =>
          user.id === editingUser ? { ...user, ...userDetails } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setEditingUser(null); // Close the edit form
        closePopup(); // Close the popup after saving
        alert("User details updated successfully!");
      } else {
        console.error("Error updating user details:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  // Show confirmation popup for deleting a user
  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setConfirmDelete(true);
  };

  // Confirm and delete the user
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        const response = await axios.delete(`${baseUrl}users/${userToDelete.id}`);
        if (response.data.success) {
          const updatedUsers = users.filter((user) => user.id !== userToDelete.id);
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          setConfirmDelete(false); // Close the confirmation popup
          setUserToDelete(null); // Clear selected user
          alert("User deleted successfully!");
        } else {
          console.error("Error deleting user:", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="users-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className={`users-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="users-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>{user.role}</td>
                <td>
                  {user.role !== "admin" && userRole === "moderator" ? (
                    <button
                      className="make-admin-btn"
                      onClick={() => makeAdmin(user.id)}
                    >
                      Make Admin
                    </button>
                  ) : (
                    userRole === "moderator" && (
                      <button
                        className="conform-no-btn"
                        onClick={() => removeAdmin(user.id)}
                      >
                        Admin
                      </button>
                    )
                  )}
                  {userRole === "moderator" && (
                    <Popup
                      trigger={<button className="edit-user-btn">Edit User</button>}
                      onOpen={() => handleEditUser(user)}
                      modal
                      closeOnDocumentClick
                      overlayStyle={{
                        background: "rgba(0, 0, 0, 0.5)",
                      }}
                      contentStyle={{
                        padding: "20px",
                        width: "400px",
                        background: "#fff",
                        borderRadius: "8px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {(close) => (
                        <div className="edit-user-form">
                          <h2>Edit User</h2>
                          <input
                            type="text"
                            name="full_name"
                            value={userDetails.full_name}
                            onChange={handleChange}
                            placeholder="Full Name"
                          />
                          <input
                            type="password"
                            name="password"
                            value={userDetails.password}
                            onChange={handleChange}
                            placeholder="Password"
                          />
                          <button onClick={() => handleSaveChanges(close)}>Save Changes</button>
                          <button onClick={close}>Cancel</button>
                        </div>
                      )}
                    </Popup>
                  )}
                  {userRole === "moderator" && (
                    <button
                      className="delete-user-btn"
                      onClick={() => handleDeleteUser(user)}
                    >
                      Delete User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Confirmation Delete Popup */}
        {confirmDelete && (
          <Popup
            open={confirmDelete}
            modal
            closeOnDocumentClick
            overlayStyle={{
              background: "rgba(0, 0, 0, 0.7)",
            }}
            contentStyle={{
              padding: "20px",
              width: "300px",
              background: "#fff",
              borderRadius: "8px",
            }}
          >
            <div className="delete-confirmation">
              <h3>Are you sure you want to delete <span>{userToDelete?.full_name}</span>?</h3>
              <div>
                <button className="conform-no-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
                <button className="conform-yes-btn" onClick={confirmDeleteUser}>Yes, Delete</button>
              </div>
            </div>
          </Popup>
        )}
      </div>
    </div>
  );
};

export default Users;

import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import "./index.css";
import axios from "axios";
import { baseUrl } from "../config";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css"; // Import Popup styles

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    password: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get-users`);
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = users.filter((user) =>
      user.full_name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredUsers(filteredData);
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const makeAdmin = async (userId) => {
    try {
      const response = await axios.patch(`${baseUrl}/users/${userId}/role`, {
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

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setUserDetails({
      full_name: user.full_name,
      password: "", // Optionally, allow the user to change the password
    });
  };

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.patch(`${baseUrl}users/${editingUser}`, userDetails);
      if (response.data.success) {
        const updatedUsers = users.map((user) =>
          user.id === editingUser ? { ...user, ...userDetails } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setEditingUser(null); // Close the edit form
        alert("User details updated successfully!");
      } else {
        console.error("Error updating user details:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
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
                  {user.role !== "admin" ? (
                    <button
                      className="make-admin-btn"
                      onClick={() => makeAdmin(user.id)}
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button className="inactive-btn" disabled>
                      Admin
                    </button>
                  )}
                  <Popup
                    trigger={
                      <button
                        className="edit-user-btn"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit User
                      </button>
                    }
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
                        <button onClick={handleSaveChanges}>Save Changes</button>
                        <button onClick={close}>Cancel</button>
                      </div>
                    )}
                  </Popup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;

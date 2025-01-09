import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import "./index.css";

const Header = ({ openPopup, closePopup, isPopupOpen }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState({
    fullName: "Guest",
    email: "",
  });

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Decode JWT from cookies and set user details
  useEffect(() => {
    const token = Cookies.get("jwtToken"); // Retrieve JWT from cookies
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode the JWT
        setUser({
          fullName: decoded.fullName || "User",
          email: decoded.email || "",
        });
      } catch (err) {
        console.error("Failed to decode JWT:", err);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    Cookies.remove("jwtToken"); // Remove JWT token from cookies
    navigate("/"); // Redirect to home
  };

  // Toggle the popup when clicking the Create button
  const handleCreateButtonClick = () => {
    if (isPopupOpen) {
      closePopup();
    } else {
      openPopup();
    }
  };

  const renderButtons = () => {
    return (
      <button
        type="button"
        className={`create-button ${isPopupOpen ? "active" : ""}`}
        onClick={handleCreateButtonClick}
      >
        {isPopupOpen ? "Close" : "Create"}
      </button>
    );
  };

  const authPath = capitalizeFirstLetter(location.pathname.slice(1)) === "Dashboard" ||  capitalizeFirstLetter(location.pathname.slice(1)) === "Projects" || /^Project(\/\d+)?$/.test(capitalizeFirstLetter(location.pathname.slice(1)));

  return (
    <header className="header">
      <div className="create-btn-container">
        <h1 className="header-title">
          {capitalizeFirstLetter(location.pathname.slice(1))}
        </h1>
        {authPath && renderButtons()}
      </div>
      <div className="user-info">
        <p className="user-welcome-text" onClick={toggleDropdown}>
          {user.fullName}
          <img
            src="/Images/userProfile.png"
            className="profile-image"
            alt="profile"
          />
        </p>
        {dropdownVisible && (
          <div className="dropdown">
            <ul>
              <li>
                <span>Account</span>
                <div className="account-profile-container">
                  <img
                    className="profile-image"
                    alt="Profile"
                    src="/Images/userProfile.png"
                  />
                  <p className="account-profile-names">
                    <span>{user.fullName}</span>
                    <span>{user.email}</span>
                  </p>
                </div>
              </li>
              <li>Profile</li>
              <li>Personal Settings</li>
              <li>Notifications</li>
              <li onClick={handleLogout}>Logout</li> {/* Logout Action */}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

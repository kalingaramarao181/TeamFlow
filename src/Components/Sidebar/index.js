import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineDashboard } from "react-icons/md";
import { FaProjectDiagram } from "react-icons/fa";
import { SiTask } from "react-icons/si";
import { TbReportAnalytics } from "react-icons/tb";
import { MdSettingsSuggest } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";
import "./index.css";

const Sidebar = ({ onToggleSidebar, isCollapsed }) => {
  const location = useLocation();

  // Get the role of the logged-in user from the JWT token
  const token = Cookies.get("jwtToken");
  let userRole = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.role;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return (
    <div className={`sidebar-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header-container">
        {!isCollapsed && (
          <>
            <h3 className="sidebar-title">TeamFlow Manager</h3>
            <img src="/logo_icon.png" alt="Logo" className="sidebar-logo" />
          </>
        )}
        <button className="sidebar-toggle-btn" onClick={onToggleSidebar}>
          {isCollapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="sidebar-navigation">
        <ul className="sidebar-menu">
          {/* Always show Your Work */}
          <li className={`sidebar-menu-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
            <Link className="sidebar-menu-link" to="/dashboard">
              <MdOutlineDashboard className="sidebar-icon" />
              <span className="sidebar-label">Your work</span>
            </Link>
          </li>

          {/* Always show Projects */}
          <li className={`sidebar-menu-item ${location.pathname === "/projects" ? "active" : ""}`}>
            <Link className="sidebar-menu-link" to="/projects">
              <FaProjectDiagram className="sidebar-icon" />
              <span className="sidebar-label">Projects</span>
            </Link>
          </li>

          {/* Show the rest of the items only if the user is not a "user" */}
          {userRole !== "user" && (
            <>
              <li className={`sidebar-menu-item ${location.pathname === "/tasks" ? "active" : ""}`}>
                <Link className="sidebar-menu-link" to="/tasks">
                  <SiTask className="sidebar-icon" />
                  <span className="sidebar-label">Tasks</span>
                </Link>
              </li>
              <li
                className={`sidebar-menu-item ${
                  location.pathname === "/reports" ? "active" : ""
                }`}
              >
                <Link className="sidebar-menu-link" to="/reports">
                  <TbReportAnalytics className="sidebar-icon" />
                  <span className="sidebar-label">Reports</span>
                </Link>
              </li>
              <li
                className={`sidebar-menu-item ${
                  location.pathname === "/teams" ? "active" : ""
                }`}
              >
                <Link className="sidebar-menu-link" to="/teams">
                  <FaRegCalendarAlt className="sidebar-icon" />
                  <span className="sidebar-label">Teams</span>
                </Link>
              </li>
              <li
                className={`sidebar-menu-item ${
                  location.pathname === "/settings" ? "active" : ""
                }`}
              >
                <Link className="sidebar-menu-link" to="/settings">
                  <MdSettingsSuggest className="sidebar-icon" />
                  <span className="sidebar-label">Settings</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

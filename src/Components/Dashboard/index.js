// Dashboard/index.js
import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import DashboardContent from "../Dashboard/DashboardContent";
import axios from "axios";
import "./index.css";
import CreateFormPopup from "../Popups/createFormPopup";
import { baseUrl } from "../config";

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [options, setOptions] = useState({
    projects: [],
    issueTypes: [
      { value: "Story", label: "Story" },
      { value: "Task", label: "Task" },
      { value: "Epic", label: "Epic" },
      { value: "Bug", label: "Bug" },
    ],
  }); 

  // Simulate backend data fetching
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseUrl}projects`); // Replace with your actual API URL
        const data = response.data;

        const formattedProjects = data.projects.map((project) => ({
          value: project.id, // Use id as the value
          label: `${project.name} (${project.projectKey})`,
          projectLogo: project.projectLogo,
          email: project.email,
          name: project.full_name,

        }));

        setOptions((prevOptions) => ({
          ...prevOptions,
          projects: formattedProjects,
        }));
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Handlers for popup
  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`dashboard-page ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar onToggleSidebar={toggleSidebar}  isCollapsed={isCollapsed} />
      <div className="main-content">
        <Header openPopup={togglePopup} closePopup={() => setIsPopupOpen(false)} isPopupOpen={isPopupOpen} />
        <DashboardContent />
        <CreateFormPopup
          isPopupOpen={isPopupOpen}
          closePopup={() => setIsPopupOpen(false)}
          options={options}
        />
      </div>
    </div>
  );
};

export default Dashboard;

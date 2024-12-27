import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import "./index.css";
import CreateProjectFormPopup from "../Popups/createPojectFormPopup";
import axios from "axios";
import { baseUrl, baseUrlImg } from "../config";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseUrl}/projects`);
        if (response.data.success) {
          setProjects(response.data.projects);
          setFilteredProjects(response.data.projects);
        } else {
          console.error("Error fetching projects:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = projects.filter((project) =>
      project.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredProjects(filteredData);
    setCurrentPage(1);
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = Array.isArray(filteredProjects)
    ? filteredProjects.slice(indexOfFirstProject, indexOfLastProject)
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleDropdown = (projectId) => {
    setDropdownOpen((prev) => (prev === projectId ? null : projectId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      //   setDropdownOpen(null); // Close the dropdown
      // }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user name for the lead of the project
  const getUserName = async (userId) => {
    try {
      const response = await axios.get(`${baseUrl}user/${userId}`);
      return response.data.full_name;
    } catch (err) {
      console.log(err);
      return "Error fetching user name"; // Return error message
    }
  };

  const UserName = ({ userId }) => {
    const [userName, setUserName] = useState("");

    useEffect(() => {
      const fetchUserName = async () => {
        const name = await getUserName(userId);
        setUserName(name);
      };

      fetchUserName();
    }, [userId]);

    return <>{userName || "Loading..."}</>;
  };

  const handleViewDetails = (projectId) => {
    navigate(`/project/${projectId}`); // Navigate to the project details page
  };

  return (
    <div className="projects-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />

      <div className={`projects-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header
          openPopup={togglePopup}
          closePopup={() => setIsPopupOpen(false)}
          isPopupOpen={isPopupOpen}
        />

        <CreateProjectFormPopup
          isPopupOpen={isPopupOpen}
          closePopup={() => setIsPopupOpen(false)}
        />

        <div className="projects-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <table className="projects-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Project Key</th>
              <th>Type</th>
              <th>Lead</th>
              <th>Project URL</th>
              <th>More Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((project) => (
              <tr key={project.id}>
                <td className="project-name-logo-container">
                  {project.projectLogo ? (
                    <img
                      src={`${baseUrlImg}uploads/${project.projectLogo}`}
                      alt="Project Logo"
                      width="50"
                      height="50"
                      className="project-logo"
                    />
                  ) : (
                    "No Logo"
                  )}
                  {project.name}
                </td>
                <td>{project.projectKey}</td>
                <td>{project.type}</td>
                <td><UserName userId={project.lead} /></td>
                <td>
                  <a
                    href={project.projectURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Link
                  </a>
                </td>
                <td className="more-actions-cell" ref={dropdownRef}>
                  <span
                    className="more-actions-dots"
                    onClick={() => toggleDropdown(project.id)}
                  >
                    ...
                  </span>
                  {dropdownOpen === project.id && (
                    <div className="dropdown-menu">
                     <button onClick={() => handleViewDetails(project.id)}>
                    View Project Details
                  </button>
                      <button onClick={() => console.log("Update Project")}>
                        Update Project
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-number">{currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * projectsPerPage >= filteredProjects.length}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Projects;

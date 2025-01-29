import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import Popup from "reactjs-popup";
import "./index.css";
import { baseUrl, baseUrlImg } from "../config";
import EditFormPopup from "../Popups/updateIssuePopup";

const IssueDetails = () => {
  const { issueId } = useParams(); // Get issueId from URL
  const [issue, setIssue] = useState(null); // State for a single issue
  const [projectName, setProjectName] = useState(""); // State for project name
  const [assigneeName, setAssigneeName] = useState(""); // State for assignee name
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapsed state
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup open state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const navigate = useNavigate();
  const [options, setOptions] = useState({
      projects: [],
      issueTypes: [
        { value: "Story", label: "Story" },
        { value: "Task", label: "Task" },
        { value: "Epic", label: "Epic" },
        { value: "Bug", label: "Bug" },
      ],
    }); 

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        // Fetch issue details
        const issueResponse = await axios.get(`${baseUrl}issues/${issueId}`);
        if (issueResponse.status === 200) {
          const issueData = issueResponse.data.issue;
          setIssue(issueData);

          // Fetch project name if project ID exists
          if (issueData.project) {
            const projectResponse = await axios.get(`${baseUrl}project-name/${issueData.project}`);
            if (projectResponse.status === 200) {
              setProjectName(projectResponse.data.projectName);
            }
          }

          // Fetch assignee name if assignee ID exists
          if (issueData.assignee) {
            const userResponse = await axios.get(`${baseUrl}get-users`);
            if (userResponse.status === 200) {
              const assignee = userResponse.data.find(
                (user) => user.id === parseInt(issueData.assignee)
              );
              setAssigneeName(assignee ? assignee.full_name : "Unassigned");
            }
          }
        } else {
          setError("Failed to fetch issue details.");
        }
      } catch (error) {
        setError("An error occurred while fetching the issue details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId]);

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

  const handleDeleteIssue = async () => {
    try {
      await axios.delete(`${baseUrl}issues/${issueId}`); 
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
    
  }
  const handleEditIssue = () => {
    setIsPopupOpen(true); // Open the popup
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "green";
      case "In Progress":
        return "orange";
      case "Closed":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return <p>Loading issue details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="issue-details-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className={`issue-details-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <button className="back-button issue-back-button" onClick={() => navigate("/dashboard")}>
          <FaArrowLeft className="back-icon" /> Back to Issues
        </button>

        {issue && (
          <div className="issue-card-theme">
            {/* Card Header */}
            <div className="card-header">
              <div
                className="status-border"
                style={{ backgroundColor: getStatusColor(issue.status) }}
              ></div>
              <div className="card-header-content">
                <h4 className="issue-title">{issue.summary}</h4>
                <p className="issue-subtitle">{projectName || "N/A"}</p>
              </div>
              <button className="issue-edit-button" onClick={handleEditIssue}>
                <CiEdit />
              </button>
            </div>

            {/* Card Details */}
            <div className="card-details">
              <p style={{ color: getStatusColor(issue.status) }}>
                <strong>Status:</strong> {issue.status || "N/A"}
              </p>
              <p>
                <strong>Priority:</strong> {issue.priority || "Medium"}
              </p>
              <p>
                <strong>Assignee:</strong> {assigneeName || "Unassigned"}
              </p>
              <p>
                <strong>Created At:</strong> {new Date(issue.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Attachment Section */}
            {issue.attachment && (
              <div className="card-attachment">
                <a
                  href={`${baseUrlImg}uploads/${issue.attachment}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Attachment
                </a>
              </div>
            )}
              <button className="remove-issue-button" onClick={() => setShowDeletePopup(true)}>Remove Issue <FaTrash /></button>
          </div>
        )}
      </div>
      {showDeletePopup && (
        <div className="user-dashboard-popup">
          <div className="user-dashboard-popup-content">
            <h3>Are you sure you want to Delete "{issue.summary}"?</h3>
            <div className="user-dashboard-popup-actions">
            <button
                className="issue-btn-cancel"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button className="btn-delete" onClick={handleDeleteIssue}>
                Delete
              </button>
              
            </div>
          </div>
        </div>
      )}
      {/* Edit Issue Popup */}
      {isPopupOpen && (
        <EditFormPopup
          isPopupOpen={isPopupOpen}
          closePopup={closePopup}
          options={options}
          issue={issue}
        />
      )}
    </div>
  );
};

export default IssueDetails;

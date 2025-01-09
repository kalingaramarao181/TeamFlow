import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import axios from "axios";
import "./index.css";
import { baseUrl, baseUrlImg } from "../config";

const IssueDetails = () => {
  const { issueId } = useParams(); // Get issueId from URL
  const [issue, setIssue] = useState(null); // State for a single issue
  const [projectName, setProjectName] = useState(""); // State for project name
  const [assigneeName, setAssigneeName] = useState(""); // State for assignee name
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

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
                <strong>Created At:</strong>{" "}
                {new Date(issue.created_at).toLocaleDateString()}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetails;

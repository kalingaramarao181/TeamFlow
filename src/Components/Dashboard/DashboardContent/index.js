import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";
import { baseUrl, baseUrlImg } from "../../config";
import {jwtDecode} from "jwt-decode";

const DashboardContent = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [assigneeNames, setAssigneeNames] = useState({});
  const [projectNames, setProjectNames] = useState({});
  const [projectKeys, setProjectKeys] = useState({});
  const [selectedProject, setSelectedProject] = useState("all");
  const [searchKey, setSearchKey] = useState(""); // State for search input
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("jwtToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setLoggedInUser(decodedToken.username || decodedToken.id);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error("Error decoding token:", error.message);
      }
    }

    const fetchIssues = async () => {
      try {
        const response = await axios.get(`${baseUrl}issues`);
        const fetchedIssues = response.data.issues || [];
        setIssues(fetchedIssues);
        await fetchProjectDetails(fetchedIssues);
        await fetchAssigneeNames(fetchedIssues);
      } catch (error) {
        console.error("Error fetching issues:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssigneeNames = async (issues) => {
      const names = {};
      for (const issue of issues) {
        if (issue.assignee && !names[issue.assignee]) {
          try {
            const response = await axios.get(`${baseUrl}user/${issue.assignee}`);
            names[issue.assignee] = response.data.full_name;
          } catch (err) {
            console.error(`Error fetching name for assignee ${issue.assignee}:`, err);
            names[issue.assignee] = "Unknown Assignee";
          }
        }
      }
      setAssigneeNames(names);
    };

    const fetchProjectDetails = async (issues) => {
      const names = {};
      const keys = {};
      for (const issue of issues) {
        if (issue.project && !names[issue.project]) {
          try {
            const response = await axios.get(`${baseUrl}project-name/${issue.project}`);
            names[issue.project] = response.data.projectName;
            keys[issue.project] = response.data.projectKey;
          } catch (err) {
            console.error(`Error fetching name for project ${issue.project}:`, err);
            names[issue.project] = "Unknown Project";
            keys[issue.project] = "UNK";
          }
        }
      }
      setProjectNames(names);
      setProjectKeys(keys);
    };

    fetchIssues();
  }, []);

  if (loading) {
    return <div className="loading">Loading issues...</div>;
  }

  // Filter issues for user role 'user'
  const userIssues =
    userRole === "user"
      ? issues.filter((issue) => parseInt(issue.assignee) === loggedInUser)
      : issues;

  // Filter issues based on selected project and searchKey
  const filteredIssues = userIssues.filter(
    (issue) =>
      (selectedProject === "all" || issue.project === selectedProject) &&
      (searchKey === "" ||
        `${projectKeys[issue.project]}-${issue.id}`.toLowerCase().includes(searchKey.toLowerCase()))
  );

  // Navigate to IssueDetails page when clicking on a card
  const handleCardClick = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  return (
    <div className="dashboard-content">
      <h3 className="section-title">Issues</h3>

      {/* Filters Row */}
      <div className="filters-row">
        {/* Project Filter Dropdown */}
        <div className="project-filter">
          <label htmlFor="project-select">Filter by Project:</label>
          <select
            id="project-select"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">All Projects</option>
            {Object.entries(projectNames).map(([projectId, projectName]) => (
              <option key={projectId} value={projectId}>
                {projectName}
              </option>
            ))}
          </select>
        </div>

        {/* Search by Key */}
        <div className="project-filter">
          <label htmlFor="search-input-label" className="project-filter-label">Search by Key:</label>
          <input
            id="search-input"
            type="text"
            placeholder="Enter key (e.g., TW-1001)"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </div>
      </div>

      <div className="issues-table-container">
        {filteredIssues.length > 0 ? (
          <table className="project-members-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Key</th>
                <th>Summary</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Attachment</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => (
                <tr key={issue.id}>
                  <td>{projectNames[issue.project] || "Loading..."}</td>
                  <td>
                    <p className="issue-key" onClick={() => handleCardClick(issue.id)}>
                    {projectKeys[issue.project]
                      ? `${projectKeys[issue.project]}-${issue.id}`
                      : "Loading..."}
                  </p>
                  </td>
                  <td>{issue.summary}</td>
                  <td>{issue.priority || "Medium"}</td>
                  <td>{assigneeNames[issue.assignee] || "Loading..."}</td>
                  <td style={{ color: getStatusColor(issue.status) }}>
                    {issue.status || "N/A"}
                  </td>
                  <td>
                    {issue.attachment ? (
                      <a
                        href={`${baseUrlImg}uploads/${issue.attachment}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Attachment
                      </a>
                    ) : (
                      "No Attachment"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No issues found.</p>
        )}
      </div>
    </div>
  );
};

// Helper Function for Status Color
const getStatusColor = (status) => {
  switch (status) {
    case "To Do":
      return "#FF7F7F"; // Red
    case "In Progress":
      return "#FFC107"; // Yellow
    case "Done":
      return "#28A745"; // Green
    default:
      return "#6C757D"; // Gray
  }
};

export default DashboardContent;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import GroupChat from "../GroupChat";
import axios from "axios";
import "./index.css";
import { baseUrl, baseUrlImg } from "../config";
import CreateFormPopup from "../Popups/createFormPopup";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [searchByKey, setSearchByKey] = useState("");
  const [searchByName, setSearchByName] = useState("");
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseUrl}projects`);
        const data = response.data;

        const formattedProjects = data.projects.map((project) => ({
          value: project.id,
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

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`${baseUrl}projects/${projectId}`);
        if (response.status === 200) {
          setProject(response.data.project);
          setMembers(response.data.members || []);
        } else {
          console.error(
            "Error fetching project details:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    const fetchProjectIssues = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}projects/${projectId}/issues`
        );
        if (response.status === 200) {
          setIssues(response.data.issues);
          setFilteredIssues(response.data.issues);
        } else {
          console.error(
            "Error fetching project issues:",
            response.data.message 
          );
        }
      } catch (error) {
        console.error("Error fetching project issues:", error);
      }
    };

    fetchProjectDetails();
    fetchProjectIssues();
  }, [projectId]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const handleCardClick = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  // Filter issues based on search input
  useEffect(() => {
    const filtered = issues.filter((issue) => {
      const matchesKey =
        searchByKey === "" ||
        `${project?.projectKey}-${issues.indexOf(issue) + 1}`
          .toLowerCase()
          .includes(searchByKey.toLowerCase());
      const matchesName =
        searchByName === "" ||
        issue.summary.toLowerCase().includes(searchByName.toLowerCase());
      return matchesKey && matchesName;
    });
    setFilteredIssues(filtered);
  }, [searchByKey, searchByName, issues, project]);

  return (
    <div className="project-details-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div
        className={`project-details-main-content ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <Header
          openPopup={togglePopup}
          closePopup={() => setIsPopupOpen(false)}
          isPopupOpen={isPopupOpen}
        />
        {project ? (
          <div className="project-details-container">
            <button
              className="back-button"
              onClick={() => navigate("/projects")}
            >
              <FaArrowLeft className="back-icon" /> Back to Projects
            </button>
            <div className="project-details-layout">
              <div className="project-details-left">
                <div className="project-details-header">
                  <div className="project-title-logo">
                    {project.projectLogo && (
                      <img
                        src={`${baseUrlImg}uploads/${project.projectLogo}`}
                        alt="Project Logo"
                        className="project-details-logo"
                      />
                    )}
                    <h1 className="project-details-title">{project.name}</h1>
                  </div>
                  <div className="project-details-info">
                    <p>
                      <strong>Key:</strong> {project.projectKey}
                    </p>
                    <p>
                      <strong>Type:</strong> {project.projectType}
                    </p>
                    <p>
                      <strong>Lead:</strong> {project.lead}
                    </p>
                  </div>
                </div>
                <div className="project-details-body">
                  <p>
                    <strong>Description:</strong>{" "}
                    <div
                      className="project-description"
                      dangerouslySetInnerHTML={{
                        __html:
                          project.description || "No description available.",
                      }}
                    />
                  </p>
                  <p>
                    <strong>URL:</strong>{" "}
                    <a
                      href={project.projectURL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.projectURL}
                    </a>
                  </p>
                </div>
              </div>
              <GroupChat projectId={projectId} members={members} />
            </div>
            {/* Issues Section */}
            <div className="project-members-section">
              <div className="project-members-header">
                <h2>Project Issues</h2>
                <div className="issue-search-container">
                  <input
                    type="text"
                    placeholder="Search by Key (e.g., KEY-1)"
                    value={searchByKey}
                    onChange={(e) => setSearchByKey(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Search by Name"
                    value={searchByName}
                    onChange={(e) => setSearchByName(e.target.value)}
                  />
                </div>
              </div>
              {filteredIssues.length > 0 ? (
                <table className="project-members-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Key</th>
                      <th>Summary</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignee</th> {/* New column for assignee */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue, index) => (
                      <tr key={issue.id}>
                        <td>{issue.id}</td>
                        <td>
                        <p className="issue-key" onClick={() => handleCardClick(issue.id)}>
                          {project.projectKey}-{issue.id}
                          </p>
                        </td>
                        <td>{issue.summary}</td>
                        <td>{issue.issue_type}</td>
                        <td>{issue.status}</td>
                        <td>{issue.priority}</td>
                        <td>{issue.assignee || "Unassigned"}</td>{" "}
                        {/* Display assignee name or "Unassigned" */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No issues found for this project.</p>
              )}
            </div>
            {/* Members Section */}
            <div className="project-members-section">
              <h2>Project Members</h2>
              {members.length > 0 ? (
                <table className="project-members-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.full_name}</td>
                        <td>{member.email}</td>
                        <td>{member.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No members found for this project.</p>
              )}
            </div>
          </div>
        ) : (
          <p>Loading project details...</p>
        )}
      </div>
      <CreateFormPopup
        isPopupOpen={isPopupOpen}
        closePopup={() => setIsPopupOpen(false)}
        options={options}
      />
    </div>
  );
};

export default ProjectDetails;

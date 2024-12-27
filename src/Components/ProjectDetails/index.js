import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Sidebar from "../Sidebar";
import Header from "../Header";
import GroupChat from "../GroupChat"; // Import the new GroupChat component
import axios from "axios";
import "./index.css";
import { baseUrl, baseUrlImg } from "../config";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

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
    fetchProjectDetails();
  }, [projectId]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="project-details-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div
        className={`project-details-main-content ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <Header />
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
              {/* Group Chat Component */}
              <GroupChat projectId={projectId} members={members} />
            </div>
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
    </div>
  );
};

export default ProjectDetails;

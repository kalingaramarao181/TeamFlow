import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  console.log(project);
  
  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-card-title">{project.name}</h3>
      </div>
      <div className="project-card-body">
        <p className="project-card-detail"><strong>Status:</strong> {project.status}</p>
        <p className="project-card-detail"><strong>Deadline:</strong> {project.deadline}</p>
        <p className="project-card-detail"><strong>Assignee:</strong> {project.assignee}</p>
      </div>
      <div className="project-card-actions">
        <button className="project-card-button edit-button" onClick={() => onEdit(project.id)}>
          Edit
        </button>
        <button className="project-card-button delete-button" onClick={() => onDelete(project.id)}>
          Delete
        </button>
        <Link to={`/project/${project.name} `}>
        <button className="project-card-button view-button" >
          View
        </button>
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import { baseUrl, baseUrlImg } from '../../config';

const DashboardContent = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get(`${baseUrl}issues`);
        setIssues(response.data.issues || []);
      } catch (error) {
        console.error('Error fetching issues:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return <div className="loading">Loading issues...</div>;
  }

  return (
    <div className="dashboard-content">
      <h3 className="section-title">Issue Cards</h3>
      <div className="issues-cards-container">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <div key={issue.id} className="issue-card-theme">
              {/* Card Header */}
              <div className="card-header">
                <div className="status-border" style={{ backgroundColor: getStatusColor(issue.status) }}></div>
                <div className="card-header-content">
                  <h4 className="issue-title">{issue.summary}</h4>
                  <p className="issue-subtitle">{issue.project}</p> 
                </div>
              </div>

              {/* Card Details */}
              <div className="card-details">
                <p style={{color: getStatusColor(issue.status)}}><strong>Status:</strong> {issue.status || 'N/A'}</p>
                <p><strong>Priority:</strong> {issue.priority || 'Medium'}</p>
                <p><strong>Assignee:</strong> {issue.assignee || 'Unassigned'}</p>
                <p><strong>Created At:</strong> {new Date(issue.created_at).toLocaleDateString()}</p>
              </div>

              {/* Attachment Section */}
              {issue.attachment && (
                <div className="card-attachment">
                  <a href={`${baseUrlImg}uploads/${issue.attachment}`} target="_blank" rel="noreferrer">
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          ))
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
    case 'To Do':
      return '#FF7F7F'; // Red
    case 'In Progress':
      return '#FFC107'; // Yellow
    case 'Done':
      return '#28A745'; // Green
    default:
      return '#6C757D'; // Gray
  }
};

export default DashboardContent;

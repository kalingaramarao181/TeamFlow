import React, { useState } from 'react';
import './index.css';

// Mock data for charts, team members, etc.
const dashboardData = {
  projects: 10,
  tasks: 25,
  teamMembers: 15,
  recentActivities: [
    { activity: 'Created new project - Website Redesign', time: '2 hours ago' },
    { activity: 'Completed task - UI Design for App', time: '4 hours ago' },
    { activity: 'Assigned new task to John Doe', time: '1 day ago' },
  ],
  tasksByStatus: { 'To Do': 5, 'In Progress': 10, 'Completed': 10 },
};

const DashboardContent = () => {
  const [recentActivities] = useState(dashboardData.recentActivities);
  const [tasksByStatus] = useState(dashboardData.tasksByStatus);

  // Mock function for rendering chart (can be replaced with real chart libraries like Chart.js or Recharts)
  const renderTasksChart = () => {
    const taskStatus = Object.keys(tasksByStatus);
    const taskCounts = Object.values(tasksByStatus);
    return (
      <div className="chart">
        <h6>Tasks by Status</h6>
        <div className="chart-bar-container">
          {taskStatus.map((status, index) => (
            <div key={status} className="chart-bar" style={{ height: `${taskCounts[index] * 20}px` }}>
              <span>{status}</span>
              <span>{taskCounts[index]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-content">
      <div className="overview-cards">
        <div className="card">
          <h5>Projects Overview</h5>
          <p>{dashboardData.projects} active projects</p>
        </div>
        <div className="card">            
          <h5>Tasks Overview</h5>
          <p>{dashboardData.tasks} tasks to be completed</p>
        </div>
        <div className="card">
          <h5>Team Members</h5>
          <p>{dashboardData.teamMembers} active members</p>
        </div>
      </div>

      <div className="dashboard-features">
        <div className="recent-activities">
          <h5>Recent Activities</h5>
          <ul>
            {recentActivities.map((activity, index) => (
              <li key={index}>
                <span>{activity.activity}</span>
                <span className="activity-time">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tasks-chart">
          {renderTasksChart()}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;

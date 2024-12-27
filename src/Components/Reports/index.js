import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { Bar, Pie } from "react-chartjs-2";
import { FaFilter } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./index.css";
import Header from "../Header";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filter, setFilter] = useState("All");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Completed Tasks",
        data: [12, 19, 7, 15, 20, 25],
        backgroundColor: "rgba(46, 204, 113, 0.7)",
      },
      {
        label: "Pending Tasks",
        data: [10, 8, 14, 11, 7, 5],
        backgroundColor: "rgba(231, 76, 60, 0.7)",
      },
    ],
  };

  const pieData = {
    labels: ["Completed", "In Progress", "To Do"],
    datasets: [
      {
        data: [40, 35, 25],
        backgroundColor: ["#27ae60", "#f1c40f", "#e74c3c"],
      },
    ],
  };

  const reportData = [
    { id: 1, project: "Website Redesign", tasks: 20, completed: 15, progress: "75%" },
    { id: 2, project: "Mobile App Development", tasks: 25, completed: 20, progress: "80%" },
    { id: 3, project: "Marketing Campaign", tasks: 15, completed: 10, progress: "66%" },
  ];

  const filteredData =
    filter === "All"
      ? reportData
      : reportData.filter((item) => parseInt(item.progress) > parseInt(filter));

  return (
    <div className={`reports-page-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className="reports-main-content">
      <Header />
        <header className="reports-header">
          <h1>Reports</h1>
          <div className="filter-dropdown">
            <label htmlFor="filter">
              <FaFilter /> Filter by Progress:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="50">Above 50%</option>
              <option value="75">Above 75%</option>
            </select>
          </div>
        </header>
        <div className="charts-section">
          <div className="bar-chart">
            <h3>Monthly Task Completion</h3>
            <Bar data={data} />
          </div>
          <div className="pie-chart">
            <h3>Task Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>
        <div className="report-table">
          <h3>Project Reports</h3>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Total Tasks</th>
                <th>Completed</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((report) => (
                <tr key={report.id}>
                  <td>{report.project}</td>
                  <td>{report.tasks}</td>
                  <td>{report.completed}</td>
                  <td>{report.progress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

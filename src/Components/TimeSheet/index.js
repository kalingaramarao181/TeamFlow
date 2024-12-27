import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { Calendar } from "react-calendar";
import { FaPlus, FaSave, FaTrash, FaClock, FaRegCalendarAlt } from "react-icons/fa";
import "react-calendar/dist/Calendar.css";
import "./index.css";
import Header from "../Header";

const TimesheetsPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [entries, setEntries] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: "",
    task: "",
    hours: "",
    status: "Pending",
  });
  const [newLeave, setNewLeave] = useState({
    date: "",
    reason: "",
  });
  const [calendarDate, setCalendarDate] = useState(new Date());

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setNewLeave({ ...newLeave, [name]: value });
  };

  const addEntry = () => {
    if (!newEntry.date || !newEntry.task || !newEntry.hours) {
      alert("Please fill out all fields!");
      return;
    }
    setEntries([...entries, { ...newEntry, id: Date.now() }]);
    setNewEntry({ date: "", task: "", hours: "", status: "Pending" });
  };

  const addLeave = () => {
    if (!newLeave.date || !newLeave.reason) {
      alert("Please fill out all fields!");
      return;
    }
    setLeaves([...leaves, { ...newLeave, id: Date.now(), status: "Pending" }]);
    setNewLeave({ date: "", reason: "" });
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const deleteLeave = (id) => {
    setLeaves(leaves.filter((leave) => leave.id !== id));
  };

  const totalHours = entries.reduce((total, entry) => total + parseFloat(entry.hours || 0), 0);

  return (
    <div className={`timesheets-page-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className="timesheets-main-content">
        <Header />

        <div className="timesheets-calendar">
          <h3>
            <FaRegCalendarAlt /> Calendar
          </h3>
          <Calendar onChange={setCalendarDate} value={calendarDate} />
        </div>

        <div className="timesheets-form">
          <h3>Add Work Entry</h3>
          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={newEntry.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-row">
            <label>Task</label>
            <input
              type="text"
              name="task"
              placeholder="Task description"
              value={newEntry.task}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-row">
            <label>Hours</label>
            <input
              type="number"
              name="hours"
              placeholder="Hours worked"
              value={newEntry.hours}
              onChange={handleInputChange}
            />
          </div>
          <button onClick={addEntry} className="add-entry-btn">
            <FaPlus /> Add Entry
          </button>
        </div>

        <div className="timesheets-leave">
          <h3>Request Leave</h3>
          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={newLeave.date}
              onChange={handleLeaveChange}
            />
          </div>
          <div className="form-row">
            <label>Reason</label>
            <input
              type="text"
              name="reason"
              placeholder="Leave reason"
              value={newLeave.reason}
              onChange={handleLeaveChange}
            />
          </div>
          <button onClick={addLeave} className="add-leave-btn">
            <FaPlus /> Request Leave
          </button>
        </div>

        <div className="timesheets-entries">
          <h3>Work Log</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="5">No entries found.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.task}</td>
                    <td>{entry.hours}</td>
                    <td>{entry.status}</td>
                    <td>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="delete-btn"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <h4>Total Hours: {totalHours}</h4>
        </div>

        <div className="timesheets-leaves">
          <h3>Leave Requests</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="4">No leave requests found.</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.date}</td>
                    <td>{leave.reason}</td>
                    <td>{leave.status}</td>
                    <td>
                      <button
                        onClick={() => deleteLeave(leave.id)}
                        className="delete-btn"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimesheetsPage;

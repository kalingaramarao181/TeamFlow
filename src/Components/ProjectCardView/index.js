import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { FaPlus, FaFilter, FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import "./index.css";

const TasksPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design Landing Page", status: "In Progress", priority: "High" },
    { id: 2, title: "Write Documentation", status: "To Do", priority: "Medium" },
    { id: 3, title: "Fix Login Bug", status: "Completed", priority: "Critical" },
  ]);
  const [newTask, setNewTask] = useState({ title: "", status: "To Do", priority: "Medium" });
  const [filter, setFilter] = useState("All");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleAddTask = () => {
    const id = tasks.length + 1;
    setTasks([...tasks, { ...newTask, id }]);     
    setNewTask({ title: "", status: "To Do", priority: "Medium" });
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleUpdateTask = (id) => {
    const updatedTask = tasks.find((task) => task.id === id);
    setNewTask(updatedTask);
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  const filteredTasks =
    filter === "All"
      ? tasks
      : tasks.filter((task) => task.status === filter || task.priority === filter);

  return (
    <div className={`tasks-page-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className="tasks-main-content">
        <header className="tasks-header">
          <h1>Task Management</h1>
          <div className="filter-buttons">
            <button onClick={() => handleFilterChange("All")}>All</button>
            <button onClick={() => handleFilterChange("To Do")}>To Do</button>
            <button onClick={() => handleFilterChange("In Progress")}>In Progress</button>
            <button onClick={() => handleFilterChange("Completed")}>Completed</button>
          </div>
        </header>
        <div className="task-creation-form">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <select
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <button onClick={handleAddTask}>
            <FaPlus /> Add Task
          </button>
        </div>
        <div className="task-list">
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-card">
              <h3>{task.title}</h3>
              <p>Status: {task.status}</p>
              <p>Priority: {task.priority}</p>
              <div className="task-actions">
                <button onClick={() => handleUpdateTask(task.id)}>
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDeleteTask(task.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;

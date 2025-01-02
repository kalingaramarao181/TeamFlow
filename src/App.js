import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./Components/Dashboard";
import Projects from "./Components/Projects";
import TasksPage from "./Components/ProjectCardView";
import ReportsPage from "./Components/Reports";
import TimesheetsPage from "./Components/TimeSheet";
import AuthPage from "./Components/Auth";
import ProjectDetails from "./Components/ProjectDetails";
import Secure from "./Components/Secure";
import Users from "./Components/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/timesheets" element={<TimesheetsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/project/:projectId" element={<ProjectDetails />} />
        {/* Secure Routes */}
        <Route element={<Secure />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

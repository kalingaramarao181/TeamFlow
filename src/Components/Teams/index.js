import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../config";
import Sidebar from "../Sidebar";
import Header from "../Header";
import CreateTeamPopup from "../Popups/createTeamPopup";
import "./index.css";

const Teams = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
    const [openTeamPopup, setOpenTeamPopup] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, projectsRes, usersRes] = await Promise.all([
          axios.get(`${baseUrl}teams`),
          axios.get(`${baseUrl}projects`),
          axios.get(`${baseUrl}get-users`),
        ]);
        setTeams(teamsRes.data.teams);
        setFilteredTeams(teamsRes.data.teams);
        setProjects(projectsRes.data.projects);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const filteredData = teams.filter((team) =>
      team.team_name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredTeams(filteredData);
  };

  const getProjectName = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const handleCreateTeamButtonClick = () => {
    setOpenTeamPopup(true);
  }

  const getUserName = (userId) => {
    const user = users.find((u) => parseInt(u.id) === parseInt(userId));
    return user ? user.full_name : "Unknown User";
  };

  const getTeamMembersNames = (teamMembers) => {
    return teamMembers.map((memberId) => (
      <div className="team-member-name" key={memberId}>{getUserName(memberId)},</div>
    ));
  };    

  return (
    <div className="users-page">
      <Sidebar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className={`users-main-content ${isCollapsed ? "collapsed" : ""}`}>
        <Header />
        <div className="teams-header">
        <h2>Teams</h2>
        <button className="create-button" onClick={handleCreateTeamButtonClick}>Create Team</button>
        </div>
        <div className="users-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Project Name</th>
              <th>Team Members</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team.id}>
                <td>{team.team_name}</td>
                <td>{getProjectName(team.project_id)}</td>
                <td>{getUserName(team.created_by)}{getTeamMembersNames(JSON.parse(team.team_members))}</td>
                <td>{getUserName(team.created_by)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateTeamPopup isTeamPopupOpen={openTeamPopup} closeTeamPopup={() => setOpenTeamPopup(false)} />
    </div>
  );
};

export default Teams;

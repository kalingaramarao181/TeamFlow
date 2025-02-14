import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { baseUrl } from "../config.js";
import axios from "axios";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";
import "./index.css";
    
const CreateTeamPopup = ({ isTeamPopupOpen, closeTeamPopup }) => {
  const [formData, setFormData] = useState({
    team_name: "",
    description: "",
    project_id: "",
    team_members: [],
    created_by: "", 
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [projects, setProjects] = useState([]); 
  const [users, setUsers] = useState([]); 
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  // Fetch Projects & Users on Component Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`${baseUrl}projects`),
          axios.get(`${baseUrl}get-users`),
        ]);
        setProjects(projectsRes.data.projects);
        setUsers(usersRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Set created_by from token
  useEffect(() => { 
    const token = Cookies.get("jwtToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken.id);
      setFormData((prev) => ({ ...prev, created_by: decodedToken.id }));
    }
  }, []);

  

  const onEditorStateChange = (state) => {
    setEditorState(state);
    try {
      const contentState = state.getCurrentContent();
      const hasText = contentState.hasText();
      const rawHtml = hasText ? draftToHtml(convertToRaw(contentState)) : "";

      setFormData((prev) => ({
        ...prev,
        description: rawHtml,
      }));
    } catch (error) {
      console.error("Failed to process editor content:", error);
      setFormData((prev) => ({ ...prev, description: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = (e) => {
    const memberId = e.target.value;
    if (memberId && !formData.team_members.includes(memberId)) {
      setFormData((prev) => ({
        ...prev,
        team_members: [...prev.team_members, memberId],
      }));
    }
  };

  const handleRemoveMember = (id) => {
    setFormData((prev) => ({
      ...prev,
      team_members: prev.team_members.filter((member) => member !== id),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.team_name.trim() || !formData.project_id || !formData.team_members.length) {
      setErrorMessage("All fields are required!");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    try {
      await axios.post(`${baseUrl}teams`, formData);
      setSuccessMessage("🎉 Team Created Successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        setFormData({ team_name: "", description: "", project_id: "", team_members: [], created_by: "" });
        setEditorState(EditorState.createEmpty());
        closeTeamPopup();
      }, 3000);
    } catch (error) {
      console.error("Error creating team:", error);
      setErrorMessage("❌ Failed to create team. Please try again.");
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  return (
    <Popup open={isTeamPopupOpen} onClose={closeTeamPopup} modal nested>
      <div className="popup-contents">
        <h2>Create Team</h2>
        <form>
          {/* Team Name */}
          <label>Team Name</label>
          <input type="text" name="team_name" value={formData.team_name} onChange={handleChange} placeholder="Enter team name" />

          {/* Select Project */}
          <label>Project</label>
          <select name="project_id" value={formData.project_id} onChange={handleChange}>
            <option value="">Select a Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          {/* Select Team Members */}
          <label>Team Members</label>
          <select onChange={handleAddMember}>
            <option value="">Add a Team Member</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>

          {/* Show Selected Members */}
          <div className="selected-members">
            {formData.team_members.map((memberId) => {
              const member = users.find((u) => u.id === parseInt(memberId));
              return (
                <div key={memberId} className="member-badge">
                  {member?.full_name}  
                  <button className="remove-member" type="button" onClick={() => handleRemoveMember(memberId)}>❌</button>
                </div>
              );
            })}
          </div>

          {/* Description Editor */}
          <label>Description</label>
          <Editor
            editorState={editorState}
            wrapperClassName="editor-wrapper"
            editorClassName="editor-content"
            onEditorStateChange={onEditorStateChange}
          />

          {/* Actions */}
          <div className="popup-actions">
            <button type="button" className="cancel-btn" onClick={closeTeamPopup}>Cancel</button>
            <button type="button" className="create-btn" onClick={handleSubmit}>Create Team</button>
          </div>
        </form>

        {/* Messages */}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </Popup>
  );
};

export default CreateTeamPopup;

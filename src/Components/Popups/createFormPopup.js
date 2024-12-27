import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html';
import { baseUrl, baseUrlImg } from "../config.js";
import "./index.css";
import axios from "axios";

const CreateFormPopup = ({ isPopupOpen, closePopup, options }) => {
  const [formData, setFormData] = useState({
    project: "",
    issueType: "",
    status: "To Do",
    summary: "",
    description: "",
    priority: "Medium",
    team: "",
    labels: "",
    sprint: "",
    linkedIssueType: "blocks",
    linkedIssue: "",
    assignee: "",
    attachment: null,
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]); 

  const onEditorStateChange = (state) => {
    setEditorState(state);
  
    try {
      const contentState = state.getCurrentContent();
  
      if (contentState.hasText()) {
        // Convert content to raw and HTML
        const rawHtml = draftToHtml(convertToRaw(contentState));
        setFormData((prev) => ({ ...prev, description: rawHtml })); // Store HTML for rendering
      } else {
        setFormData((prev) => ({ ...prev, description: "" })); // Clear description if empty
      }
    } catch (error) {
      console.error("Failed to process editor content:", error);
    }
  };

  useEffect(() => {
    // Fetch logged-in user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get('your-backend-api-url/user'); 
        setLoggedInUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // Fetch users data 
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}get-users`); 
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUserData();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    if (!formData.summary.trim()) {
      setErrorMessage("Summary is required!");
      setErrorMessageVisible(true);
      setTimeout(() => {
        setErrorMessageVisible(false);
      }, 5000);
      return;
    }
  
    const assignee = users.find((user) => user.id === parseInt(formData.assignee));
    
    if (!assignee) {
      setErrorMessage("Valid assignee is required!");
      setErrorMessageVisible(true);
      setTimeout(() => {
        setErrorMessageVisible(false);
      }, 5000);
      return;
    }
  
    const emailPayload = {
      assigneeEmail: assignee.email,
      assigneeName: assignee.full_name,
      issueDetails: {
        summary: formData.summary,
        description: formData.description,
        status: formData.status,
        // Add other necessary issue details here
      },
    };
  
    try {
      // First, send the email to the assignee
      const emailResponse = await axios.post(`${baseUrl}send-mail`, emailPayload);
      if (emailResponse.data.success) {
        // If email was sent successfully, create the issue
        const payload = new FormData();
        for (let key in formData) {
          payload.append(key, formData[key]);
        }
  
        await axios.post(`${baseUrl}issues`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        setSuccessMessageVisible(true);
        setTimeout(() => {
          setSuccessMessageVisible(false);
          setFormData({
            project: "",
            issueType: "",
            status: "To Do",
            summary: "",
            description: "",
            priority: "Medium",
            team: "",
            labels: "",
            sprint: "",
            linkedIssueType: "blocks",
            linkedIssue: "",
            assignee: "",
            attachment: null,
          });
          setEditorState(EditorState.createEmpty());
          closePopup(); // Close the popup after success
        }, 3000);
      } else {
        throw new Error("Failed to send email. Issue creation aborted.");
      }
    } catch (error) {
      console.error("Error:", error);
  
      const errorResponse = error.response
        ? error.response.data
        : "An error occurred. Please try again.";
      setErrorMessage(errorResponse.message || errorResponse);
  
      setErrorMessageVisible(true);
  
      setTimeout(() => {
        setErrorMessageVisible(false);
      }, 5000);
    }
  };
  
  

  const handleAssigneeChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      assignee: e.target.value, // Update the assignee with selected user
    }));
  };

  return (
    <Popup
      open={isPopupOpen}
      onClose={closePopup}
      modal
      nested
      contentStyle={{ zIndex: 2, borderRadius: "12px", padding: "20px" }}
      overlayStyle={{ zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div className="popup-content">
        <h2>Create Issue</h2>
        <form>
          {/* Project */}
          <label htmlFor="project">Project</label>
          <select
            id="project"
            name="project"
            value={formData.project}
            onChange={handleChange}
          >
            <option value="">Select Project</option>
            {options.projects.map((option) => (
              <option key={option.value} value={option.value}>
                <img className="label-img-logo" alt="Project Logo" src={`${baseUrlImg}uploads/${option.projectLogo}`}/>
                {option.label}
              </option>
            ))}
          </select>

          {/* Issue Type */}
          <label htmlFor="issueType">Issue Type</label>
          <select
            id="issueType"
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
          >
            <option value="">Select Issue Type</option>
            {options.issueTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Status */}
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Summary */}
          <label htmlFor="summary">Summary</label>
          <input
            type="text"
            id="summary"
            name="summary"
            className="popup-input"
            placeholder="Enter issue summary"
            value={formData.summary}
            onChange={handleChange}
          />

          {/* Description */}
          <label htmlFor="description">Description</label>
          <Editor
            editorState={editorState}
            wrapperClassName="editor-wrapper"
            editorClassName="editor-content"
            onEditorStateChange={onEditorStateChange}
            toolbar={{
              options: ["inline", "blockType", "list", "link", "emoji"],
              inline: { options: ["bold", "italic", "underline"] },
            }}
          />

          {/* Priority */}
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Team */}
          <label htmlFor="team">Team</label>
          <select
            id="team"
            name="team"
            value={formData.team}
            onChange={handleChange}
          >
            <option value="H1B Team">H1B Team</option>
            <option value="DBM Team">DBM Team</option>
            <option value="Web Team">Web Team</option>
          </select>

          {/* Linked Issues */}
          <label>Linked Issues</label>
          <select
            name="linkedIssueType"
            value={formData.linkedIssueType}
            onChange={handleChange}
          >
            <option value="blocks">Blocks</option>
            <option value="is blocked by">Is Blocked By</option>
            <option value="relates to">Relates To</option>
          </select>
          <select
            name="linkedIssue"
            value={formData.linkedIssue}
            onChange={handleChange}
          >
            <option value="">Select Issue</option>
            <option value="Issue-1">Issue 1</option>
            <option value="Issue-2">Issue 2</option>
          </select>

          {/* Assignee */}
          <label>Assignee</label>
          <select
        value={formData.assignee || ''}
        onChange={handleAssigneeChange}
      >
        <option value="">Select Assignee</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.full_name} 
          </option>
        ))}
      </select>

      {loggedInUser && !formData.assignee && (
        <button onClick={() => setFormData({ ...formData, assignee: loggedInUser.id })}>
          Assign to me
        </button>
      )}

          {/* Attachment */}
          <div className="attachment-wrapper">
            <label>Attachment</label>
            <div className="attachment-box">
              <p>
                📁 Drop files to attach or{" "}
                <span className="browse">Browse</span>
              </p>
              <input
                type="file"
                id="fileInput"
                className="file-input"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="popup-actions">
            <button className="cancel-btn" onClick={closePopup} type="button">
              Cancel
            </button>
            <button className="create-btn" onClick={handleSubmit} type="button">
              Create
            </button>
          </div>
        </form>
        {successMessageVisible && (
          <div className="success-message">
            🎉 Issue Created Successfully! 💥
          </div>
        )}
        {errorMessageVisible && (
          <div className="error-message">❌ {errorMessage} 🚨</div>
        )}
      </div>
    </Popup>
  );
};

export default CreateFormPopup;

import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { baseUrl } from "../config.js";
import Cookies from "js-cookie";
import axios from "axios";
import "./index.css";

const EditIssuePopup = ({ isPopupOpen, closePopup, options, issue }) => {

  const [formData, setFormData] = useState({
    project: "",
    issue_type: "",
    status: "",
    summary: "",
    description: "",
    priority: "",
    team: "",
    labels: "",
    sprint: "",
    linkedIssueType: "",
    linked_issue: "",
    assignee: "",
    attachment: null,
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const loggedInUser = { id: 1, full_name: "John Doe" };
  const userRole = "admin";

  useEffect(() => {
    if (issue) {
      const { description } = issue;
      const contentBlock = htmlToDraft(description || "");
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      const editorState = EditorState.createWithContent(contentState);

      setEditorState(editorState);
      setFormData({
        ...issue,
        attachment: null,
      });
    }
  }, [issue]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseUrl}get-users`);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const onEditorStateChange = (state) => {
    setEditorState(state);

    const contentState = state.getCurrentContent();
    if (contentState.hasText()) {
      const rawHtml = draftToHtml(convertToRaw(contentState));
      setFormData((prev) => ({ ...prev, description: rawHtml }));
    } else {
      setFormData((prev) => ({ ...prev, description: "" }));
    }
  };

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
      setTimeout(() => setErrorMessageVisible(false), 5000);
      return;
    }

    try {
      const payload = new FormData();
      for (let key in formData) {
        payload.append(key, formData[key]);
      }

      // Send the PUT request to update the issue
      await axios.put(`${baseUrl}issues/${issue.id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessageVisible(true);
      setTimeout(() => {
        setSuccessMessageVisible(false);
        closePopup();
        window.location.reload();
      }, 3000);
                      
    } catch (error) {
      console.error("Error updating issue:", error);

      const errorResponse = error.response
        ? error.response.data
        : "An error occurred. Please try again.";
      setErrorMessage(errorResponse.message || errorResponse);
      setErrorMessageVisible(true);
      setTimeout(() => setErrorMessageVisible(false), 5000);
    }
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
      <div className="popup-contents">
        <h2>Update Issue</h2>
        <form>
          {/* Project */}
          <label htmlFor="project">Project *</label>
          <select
            id="project"
            name="project"
            value={formData.project}
            onChange={handleChange}
          >
            <option value="">Select Project</option>
            {options.projects.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Issue Type */}
          <label htmlFor="issueType">Issue Type *</label>
          <select
            id="issueType"
            name="issue_type"
            value={formData.issue_type}
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
          <label htmlFor="summary">Summary *</label>
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
            <option value="">Select Team</option>
            <option value="H1B Team">H1B Team</option>
            <option value="DBM Team">DBM Team</option>
            <option value="Web Team">Web Team</option>
          </select>

          {/* Linked Issues type */}
          <label htmlFor="linkedIssueType">Linked Issues Type</label>
          <select
            id="linkedIssueType"
            name="linkedIssueType"
            value={formData.linkedIssueType}
            onChange={handleChange}
          >
            <option value="blocks">Blocks</option>
            <option value="is blocked by">Is Blocked By</option>
            <option value="relates to">Relates To</option>
          </select>
          {/* Linked Issues type */}
          <label htmlFor="linkedIssue">Linked Issue</label>
          <select
            id="linkedIssue"
            name="linked_issue"
            value={formData.linked_issue}
            onChange={handleChange}
          >
            <option value="">Select Issue</option>
            <option value="">Select Issue</option>
            <option value="Issue-1">Issue 1</option>
            <option value="Issue-2">Issue 2</option>
          </select>

          {/* Assignee */}
          <label htmlFor="assignee">Assignee</label>
          <select
            id="assignee"
            name="assignee"
            value={formData.assignee} 
            onChange={handleChange}
          >
            <option value="">
              {users.find((user) => user.id === parseInt(formData.assignee))
                ?.full_name || "Select an assignee"}
            </option>
            {/* if we want to add in feature */}
            {/* {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))} */}
          </select>

          {/* Attachment */}
          <label htmlFor="attachment">Attachment</label>
          <input type="file" id="attachment" onChange={handleFileChange} />

          {/* Actions */}
          <div className="popup-actions">
            <button className="cancel-btn" onClick={closePopup} type="button">
              Cancel
            </button>
            <button className="create-btn" onClick={handleSubmit} type="button">
              Update
            </button>
          </div>
        </form>

        {/* Success and Error Messages */}
        {successMessageVisible && (
          <div className="success-message">🎉 Issue Updated Successfully!</div>
        )}
        {errorMessageVisible && (
          <div className="error-message">❌ {errorMessage}</div>
        )}
      </div>
    </Popup>
  );
};

export default EditIssuePopup;

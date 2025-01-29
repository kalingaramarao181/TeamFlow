import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from 'draftjs-to-html';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { baseUrl } from "../config.js";
import "./index.css";
import axios from "axios";

const CreateProjectFormPopup = ({ isPopupOpen, closePopup, options }) => {
  const [formData, setFormData] = useState({
    projectLogo: null,
    name: "",
    key: "",
    type: "",
    lead: "",
    projectURL: "",
    description: "",
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [leads, setLeads] = useState([]);


  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${baseUrl}get-users`); 
        setLeads(response.data);
      } catch (error) {
        console.error('Error fetching project leads:', error);
      }
    };

    fetchLeads();
  }, []);


  // Fixed onEditorStateChange to prevent the bug
  const onEditorStateChange = (state) => {
    setEditorState(state);


  
  
    try {
      const contentState = state.getCurrentContent();
      const hasText = contentState.hasText();
  
      if (hasText) {
        const rawContent = JSON.stringify(convertToRaw(contentState));
        const rawHtml = draftToHtml(convertToRaw(contentState));
  
        setFormData((prev) => ({
          ...prev,
          description: rawHtml,
          rawDescription: rawContent,
        }));
      } else {
        setFormData((prev) => ({ ...prev, description: "", rawDescription: "" }));
      }
    } catch (error) {
      console.error("Failed to process editor content:", error);
      setFormData((prev) => ({ ...prev, description: "", rawDescription: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, projectLogo: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.key.trim()) {
        setErrorMessage("Name and Key are required!"); // Extract and show the message
  
        // Show error message
        setErrorMessageVisible(true);
  
        setTimeout(() => {
          setErrorMessageVisible(false);
        }, 5000); // Hide after 3 seconds
      return;
    }

    const payload = new FormData();
    for (let key in formData) {
      payload.append(key, formData[key]);
    }

    try {
      await axios.post(`${baseUrl}projects`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMessageVisible(true);
      setTimeout(() => {
        setSuccessMessageVisible(false);
        setFormData({
            projectLogo: null,
            name: "",
            key: "",
            type: "",
            lead: "",
            projectURL: "",
            description: "",
          });
          setEditorState(EditorState.createEmpty());
        closePopup(); // Close the popup after success
      }, 3000); // Hide after 3 seconds
    } catch (error) {
        console.error("Error creating project:", error);

        // Check if backend provides a specific error message
        const errorResponse = error.response ? error.response.data : "Failed to create project. Please try again.";
        setErrorMessage(errorResponse.message || errorResponse); // Extract and show the message
  
        // Show error message
        setErrorMessageVisible(true);
  
        // Hide error message after a short delay
        setTimeout(() => {
          setErrorMessageVisible(false);
        }, 5000); // Hide after 3 seconds
    }
  };

  const handleLeadChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      lead: e.target.value, // Update the lead with selected user
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
      <div className="popup-contents">
        <h2>Create Project</h2>
        <form>
          {/* Name */}
          <label htmlFor="name">Project Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="popup-input"
            placeholder="Enter project name"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Project Logo */}
          <label htmlFor="projectLogo">Project Logo</label>
          <div className="attachment-box">
            <p>
              📁 Drop files to attach or <span className="browse">Browse</span>
            </p>
            <input
              type="file"
              id="projectLogo"
              name="projectLogo"
              className="file-input"
              onChange={handleFileChange}
            />
          </div>

          {/* Key */}
          <label htmlFor="key">Project Key</label>
          <input
            type="text"
            id="key"
            name="key"
            className="popup-input"
            placeholder="Enter project key"
            value={formData.key}
            onChange={handleChange}
          />

          {/* Type */}
          <label htmlFor="type">Project Type</label>
          <input
            type="text"
            id="type"
            name="type"
            className="popup-input"
            placeholder="Enter project type"
            value={formData.type}
            onChange={handleChange}
          />

          {/* Lead */}
          <label htmlFor="lead">Project Lead</label>
          <select
        id="lead"
        name="lead"
        className="popup-input"
        value={formData.lead || ''}
        onChange={handleLeadChange}
      >
        <option value="">Select Project Lead</option>
        {/* Map through the leads and create an option for each lead */}
        {leads.map((lead) => (
          <option key={lead.id} value={lead.id}>
            {lead.full_name} {/* Assuming the lead object contains 'id' and 'name' */}
          </option>
        ))}
      </select>

          {/* Project URL */}
          <label htmlFor="projectURL">Project URL</label>
          <input
            type="url"
            id="projectURL"
            name="projectURL"
            className="popup-input"
            placeholder="Enter project URL"
            value={formData.projectURL}
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
            🎉 Project Created Successfully! 💥
          </div>
        )}
        {errorMessageVisible && (
          <div className="error-message">
            ❌ {errorMessage} 🚨
          </div>
        )}
      </div>
    </Popup>
  );
};

export default CreateProjectFormPopup;

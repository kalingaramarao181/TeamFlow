import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./index.css";

const Chatbox = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (isChatOpen) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/api/projects/${projectId}/chat`, {
            withCredentials: true,
          });
          setMessages(response.data.messages);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [isChatOpen, projectId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `/api/projects/${projectId}/chat`,
        { message: newMessage },
        { withCredentials: true }
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        response.data.newMessage,
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="chatbox-wrapper">
      <button className="toggle-chat-btn" onClick={toggleChat}>
        {isChatOpen ? "Close Chat" : "Click to Open Chat"}
      </button>

      <div className={`chatbox-container ${isChatOpen ? "open" : "closed"}`}>
        <div className="chatbox-header">
          <h3>Group Chat</h3>
        </div>
        <div className="chatbox-body">
          {loading ? (
            <p>Loading chat...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${
                  msg.sender_id ===
                  JSON.parse(atob(document.cookie.split("token=")[1].split(".")[1]))
                    .id
                    ? "self"
                    : ""
                }`}
              >
                <strong>{msg.sender_name}</strong>: {msg.message}
              </div>
            ))
          ) : (
            <p>No messages yet. Start the conversation!</p>
          )}
        </div>
        <div className="chatbox-footer">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;

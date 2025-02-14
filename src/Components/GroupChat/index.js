import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { RiDeleteBin5Line } from "react-icons/ri";
import { jwtDecode } from "jwt-decode";
import moment from "moment"; // For formatting dates
import "./index.css";
import { baseUrl } from "../config"; // Ensure baseUrl is correct

const Chatbox = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const token = Cookies.get("jwtToken");
  const userId = token ? jwtDecode(token).id : null;

  // Fetch messages from the backend
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${baseUrl}/projects/${projectId}/chat`, {
        withCredentials: true,
      });
      console.log("Fetched Messages:", response.data.messages); // Debugging
      setMessages(response.data.messages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Auto-refresh chat every second when chat is open
  useEffect(() => {
    if (isChatOpen) {
      fetchMessages(); // Initial fetch
      const interval = setInterval(fetchMessages, 1000); // Fetch every second
      return () => clearInterval(interval); // Cleanup
    }
  }, [isChatOpen, projectId]);

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `${baseUrl}/projects/${projectId}/chat/${userId}`,
        { message: newMessage },
        { withCredentials: true }
      );

      setMessages((prevMessages) => [...prevMessages, response.data.newMessage]);
      setNewMessage("");
      fetchMessages(); // Refresh chat after sending message
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Delete a message
  const deleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      await axios.delete(`${baseUrl}/delete-chat/${messageToDelete.id}`, {
        withCredentials: true,
      });

      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageToDelete.id));
      setIsConfirmDelete(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Format date
  const formatDate = (date) => {
    const today = moment().startOf("day");
    const messageDate = moment(date);
    if (messageDate.isSame(today, "day")) return "Today";
    if (messageDate.isSame(today.subtract(1, "days"), "day")) return "Yesterday";
    return messageDate.format("MMMM D, YYYY");
  };

  // Format time
  const formatTime = (date) => moment(date).format("hh:mm A");

  // Group messages by date
  const groupMessagesByDate = () => {
    const groupedMessages = [];
    let currentGroup = null;

    messages.forEach((msg) => {
      const messageDate = formatDate(msg.created_at);
      if (!currentGroup || currentGroup.date !== messageDate) {
        if (currentGroup) groupedMessages.push(currentGroup);
        currentGroup = { date: messageDate, messages: [] };
      }
      currentGroup.messages.push(msg);
    });

    if (currentGroup) groupedMessages.push(currentGroup);
    return groupedMessages;
  };

  return (
    <div className="chatbox-wrapper">
      <button className="toggle-chat-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? "Close Chat" : "Click to Open Chat"}
      </button>

      <div className={`chatbox-container ${isChatOpen ? "open" : "closed"}`}>
        <div className="chatbox-header">
          <h3>Group Chat</h3>
        </div>

        <div className="chatbox-body">
          {loading ? (
            <p>Loading chat...</p>
          ) : groupMessagesByDate().length > 0 ? (
            groupMessagesByDate().map((group, idx) => (
              <div key={idx}>
                <div className="chat-date">{group.date}</div>
                {group.messages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.sender_id === parseInt(userId) ? "self" : ""}`}>
                    <strong>{msg.sender_id === parseInt(userId) ? "You" : msg.sender_name}</strong>: {msg.message}
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                    {msg.sender_id === parseInt(userId) && (
                      <button className="delete-btn" onClick={() => {
                        setIsConfirmDelete(true);
                        setMessageToDelete(msg);
                      }}>
                        <RiDeleteBin5Line />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>No messages yet. Start the conversation!</p>
          )}
        </div>

        {/* Confirmation Popup */}
        {isConfirmDelete && (
          <div className="confirmation-popup">
            <p>Are you sure you want to delete this message?</p>
            <button onClick={deleteMessage}>Yes</button>
            <button onClick={() => setIsConfirmDelete(false)}>No</button>
          </div>
        )}

        <div className="chatbox-footer">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;

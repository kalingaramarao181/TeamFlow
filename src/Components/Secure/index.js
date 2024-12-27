import React from "react";
import Cookies from "js-cookie";
import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const Secure = () => {
  const token = Cookies.get("jwtToken");

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds

      // Check if token is expired
      if (decodedToken.exp < currentTime) {
        alert("Session expired. Please log in again.");
        Cookies.remove("jwtToken"); 
        return <Navigate to="/" replace />;
      }

      // Check if the user's role is 'admin'
      if (decodedToken.role === "admin") {
        return <Outlet />; // Allow access to protected routes
      } else {
        alert("Access denied. Only admins are allowed.");
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error("Invalid token:", error);
      Cookies.remove("jwtToken"); // Remove invalid token
      return <Navigate to="/" replace />;
    }
  }

  // If no token, redirect to login page
  return <Navigate to="/" replace />;
};

export default Secure;

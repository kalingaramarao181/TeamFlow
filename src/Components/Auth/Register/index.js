import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../config";

const RegisterForm = () => {
  const [errorMessage, setErrorMessage] = useState(null); // For displaying server-side errors
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formError, setFormError] = useState(false); // For tracking if there's a form submission error

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    // Check for empty fields
    if (!userDetails.fullName) {
      formErrors.fullName = "Full Name is required.";
      isValid = false;
    }

    // Validate email format (Gmail)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!userDetails.email) {
      formErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailPattern.test(userDetails.email)) {
      formErrors.email = "Please enter a valid Gmail address.";
      isValid = false;
    }

    // Strong password validation
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!userDetails.password) {
      formErrors.password = "Password is required.";
      isValid = false;
    } else if (!passwordPattern.test(userDetails.password)) {
      formErrors.password =
        "Password must be at least 8 characters long and contain letters, numbers, and special characters.";
      isValid = false;
    }

    // Confirm password validation
    if (userDetails.password !== userDetails.confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();

    console.log(userDetails);
    

    // Validate the form before submitting
    if (!validateForm()) {
      return;
    }

    // Reset form error before submitting
    setFormError(false);
    setErrorMessage(null);

    try {
      // Submit data if validation passes
      await axios.post(`${baseUrl}signup`, userDetails);
      alert("User successfully created");
  } catch (err) {
      setFormError(true);
  
      if (err.response) {
          const { status, data } = err.response;
          if (status === 400) {
              setErrorMessage(data.error || "Invalid request.");
          } else if (status === 500) {
              setErrorMessage("Internal Server Error. Please try again later.");
          } else {
              setErrorMessage(data.error || "An error occurred.");
          }
      } else if (err.request) {
          setErrorMessage("No response from server. Please check your network connection.");
      } else {
          setErrorMessage("Error in request setup: " + err.message);
      }
  }
  };

  return (
    <div>
      <form className="auth-form" onSubmit={handleSubmitDetails}>
        <input
          name="fullName"
          value={userDetails.fullName}
          onChange={handleChange}
          className={`auth-input ${errors.fullName ? "error-border" : ""}`}
          type="text"
          placeholder="Enter your full name"
        />
        {errors.fullName && <p className="auth-error">{errors.fullName}</p>}

        <input
          name="email"
          value={userDetails.email}
          onChange={handleChange}
          className={`auth-input ${errors.email ? "error-border" : ""}`}
          type="email"
          placeholder="Enter your email"
        />
        {errors.email && <p className="auth-error">{errors.email}</p>}

        <input
          name="password"
          value={userDetails.password}
          onChange={handleChange}
          className={`auth-input ${errors.password ? "error-border" : ""}`}
          type="password"
          placeholder="Enter your password"
        />
        {errors.password && <p className="auth-error">{errors.password}</p>}

        <input
          name="confirmPassword"
          value={userDetails.confirmPassword}
          onChange={handleChange}
          className={`auth-input ${errors.confirmPassword ? "error-border" : ""}`}
          type="password"
          placeholder="Confirm password"
        />
        {errors.confirmPassword && (
          <p className="auth-error">{errors.confirmPassword}</p>
        )}

        {/* Register Button */}
        <button type="submit" className={`auth-btn ${formError ? "error-button" : ""}`}>
          Register
        </button>

        {/* Display error message below the button if there is a server error */}
        {formError && errorMessage && (
          <p className="auth-error server-error">{errorMessage}</p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;

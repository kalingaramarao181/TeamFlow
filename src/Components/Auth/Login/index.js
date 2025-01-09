import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../config";
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState(null); // For server-side errors
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setLoginDetails({
      ...loginDetails,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: "", // Clear errors for the current field
    });
  };

  // Validate inputs
  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!loginDetails.email) {
      formErrors.email = "Email is required.";
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(loginDetails.email)) {
      formErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (!loginDetails.password) {
      formErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    // Validate form inputs
    if (!validateForm()) return;

    try {
      const res = await axios.post(`${baseUrl}login`, loginDetails);
      Cookies.set("jwtToken", res.data.token, { expires: 30 });
      localStorage.setItem('senderData', JSON.stringify(res.data.user));
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      console.error('Login Error:', err.response ? err.response.data : err.message);
      setErrorMessage(err.response ? err.response.data.error : "An unexpected error occurred.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmitLogin} className="auth-form-container">
        <input
          name="email"
          value={loginDetails.email}
          onChange={handleChange}
          className={`auth-input ${errors.email ? "error-border" : ""}`}
          type="email"
          placeholder="Enter your email"
        />
        {errors.email && <p className="auth-error">{errors.email}</p>}

        <input
          name="password"
          value={loginDetails.password}
          onChange={handleChange}
          className={`auth-input ${errors.password ? "error-border" : ""}`}
          type="password"
          placeholder="Enter your password"
        />
        {errors.password && <p className="auth-error">{errors.password}</p>}

        <button type="submit" className="auth-btn">
          Login
        </button>

        {/* Display server-side error message */}
        {errorMessage && <p className="auth-error server-error">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default LoginForm;

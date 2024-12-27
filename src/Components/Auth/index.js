import React, { useState } from "react";
import "./index.css";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import MainHeader from "../MainHeader";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
    <MainHeader />
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-tabs">
          <div
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => handleTabClick("login")}
          >
            Login
          </div>
          <div
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => handleTabClick("register")}
          >
            Register
          </div>
        </div>
        <div className="auth-form">
          {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;

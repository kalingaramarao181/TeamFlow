import React, { useState } from "react";
import "./index.css";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import MainHeader from "../MainHeader";
import UpdatePassword from "./UpdatePassword";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderForms = () => {
    if (activeTab === "login") {
      return <LoginForm handleTabClick={handleTabClick} />;
      } else if (activeTab === "register") {
        return <RegisterForm handleTabClick={handleTabClick} />;
      }
      else if (activeTab === "forgot-form") {
        return <UpdatePassword handleTabClick={handleTabClick} />
      }
    };

  return (
    <>
    <MainHeader />
    <div className="auth-container">
      <div className="auth-box">
        {activeTab === "forgot-form" ?
         <div className="auth-tabs">
         <div
           className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
         >
           Reset Password
         </div>
       </div> :
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
        }
        <div className="auth-form">
          {renderForms()}
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthPage;

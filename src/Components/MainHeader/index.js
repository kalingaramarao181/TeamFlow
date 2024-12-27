import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // For decoding JWT
import "./index.css";

const MainHeader = () => {
    return (
        <header className="header">
            <div className="create-btn-container">
                <h3 className="sidebar-title" style={{color: "white"}}>TeamFlow Manager</h3>
            </div>
            <div className="user-info">

                <div className="dropdown">
                    <button
                        type="button"
                    >
                        Login
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;

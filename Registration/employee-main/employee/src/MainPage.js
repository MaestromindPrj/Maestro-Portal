import React from 'react';
import './MainPage.css';
import { Link } from 'react-router-dom';

export default function MainPage() {
  return (
    <div
      className="main-bg"
       style={{
                    backgroundImage: "url('/background.jpg')", // ✅ Correct for public folder
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
    >
      <div className="main-container">
        {/* Left Section - Logo */}
        <div className="left-section">
          <img src="/logo.png" alt="Logo" className="main-logo" />
          <div className="title">WELCOME TO MAESTROMINDS</div>
        </div>
        <div className="vertical-divider"></div>

        <div className="right-section">
          <h2 className="main-title">Join Now</h2>

          {/* Register Buttons */}
          <Link to="/register-intern" className="main-button">Register as Intern</Link>
          <div className="or-text">or</div>
          <Link to="/register-employee" className="main-button">Register as Employee</Link>

          {/* Divider */}
          <div className="divider">
            <hr /><span>Sign Up</span><hr />
          </div>

          <div className="divider">
            <hr /><span>Sign In</span><hr />
          </div>

          {/* Sign In Buttons */}
          <Link to="/login-intern" className="main-button">Sign in as Intern</Link>
          <div className="or-text">or</div>
          <Link to="/login-employee" className="main-button">Sign in as Employee</Link>
        </div>
      </div>
    </div>
  );
}

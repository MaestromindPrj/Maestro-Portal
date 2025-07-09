import React, { useState, useEffect } from 'react';
import './MainPage.css';
import { Link } from 'react-router-dom';

export default function MainPage() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div
      className="main-bg"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className={`main-container ${animate ? 'flip-in' : ''}`}>
        <div className="left-section" style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="Logo" className="main-logo" />
          <div className="title">WELCOME TO MAESTROMINDS</div>

          {/* 🔽 Login as Admin Button */}
          <Link to="/login">
            <button className='main-button'
              >
              Login as Admin
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

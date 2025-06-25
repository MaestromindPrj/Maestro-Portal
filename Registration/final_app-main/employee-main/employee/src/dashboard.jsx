import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct named import
import './Form.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('❗ Please login first.');
      navigate('/');
    } else {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email);  // ✅ You can also use decoded.name or mobileNumber
      } catch (err) {
        alert('❗ Invalid token. Please login again.');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('✅ You have been logged out.');
    navigate('/');
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="form-container">
        <div className="header-row">
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="logo-img" />
          </div>
          <h2 className="dashboard-title">🎓 Dashboard</h2>
        </div>

        <p style={{ marginTop: '20px' }}>
          👋 Welcome, <strong>{userEmail}</strong>!
        </p>

        <button onClick={handleLogout} className="login-btn" style={{ marginTop: '20px' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

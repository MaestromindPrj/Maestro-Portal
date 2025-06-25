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
      alert('Please login first.');
      navigate('/');
    } else {
      try {
        const decoded = jwtDecode(token); // ✅ Decoding JWT properly
        setUserEmail(decoded.email); // You can also use decoded.name or other fields if needed
      } catch (err) {
        alert('Invalid token. Please login again.');
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="form-container">
        <div className="header-row">
          <div className="logo">
            <img src="/logo.jpg" alt="Logo" className="logo-img" />
          </div>
          <h2 className="dashboard-title">Dashboard</h2>
        </div>
        <p style={{ marginTop: '20px' }}>
          Welcome, <strong>{userEmail}</strong>!
        </p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

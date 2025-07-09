import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Form.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first.');
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded.email || decoded.id); // Works with both id and email
      } catch (err) {
        alert('Invalid token. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app" style={{
      backgroundImage: "url('/background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <div className="form-container">
        <div className="header-row">
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="logo-img" />
          </div>
          <h2 className="dashboard-title">Dashboard</h2>
        </div>

        <p style={{ marginTop: '20px', fontSize: '16px' }}><br></br>
          Welcome, <strong>Admin</strong>!
        </p>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
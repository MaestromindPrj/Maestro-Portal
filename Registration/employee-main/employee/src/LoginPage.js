import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: '', // Email or mobile number
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Login successful');
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="form-container">
        <div className="header-row">
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="logo-img" />
          </div>
          <h2 className="login-title">MAESTROMINDS</h2>
        </div>
        <br />

        <form onSubmit={handleLogin}>
          {/* Identifier Field */}
          <div className="input-group">
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
            <label>Email or Mobile Number</label>
            <i className="fas fa-user input-icon-right"></i>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label>Password</label>
            <i
              className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} input-icon-right password-toggle-icon`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>

          <button type="submit">Login</button>

          <p><Link to="/reset-password">Forgot Password?</Link></p>
          <p>Don't have an account? <Link to="/register-employee">Register</Link></p>
        </form>
      </div>
    </div>
  );
}

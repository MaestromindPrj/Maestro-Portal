// frontend/LoginPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '', otp: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isEmail = val => /\S+@\S+\.\S+/.test(val);
  const isMobile = val => /^[6-9]\d{9}$/.test(val);

  const handleSendOtp = async () => {
    const { identifier, password } = formData;
    if (!identifier.trim() || !password.trim()) return alert("Email or Mobile and password are required.");

    try {
      const response = await fetch('http://localhost:5000/api/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        setOtpSent(true);
        setTimer(30);
      }
    } catch (err) {
      alert("OTP request failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { identifier, password, otp } = formData;
    if (!identifier || !password || !otp) return alert("All fields are required");

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, otp })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="app" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover' }}>
      <div className="form-container">
        <div className="header-row">
          <div className="logo"><img src="/logo.png" alt="Logo" className="logo-img" /></div>
          <h2 className="login-title">MAESTROMINDS</h2>
        </div><br />

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required />
            <label>Email or Mobile</label>
            <i className="fas fa-user input-icon-right"></i>
          </div>

          <div className="input-group">
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required />
            <label>Password</label>
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} input-icon-right`} onClick={() => setShowPassword(!showPassword)}></i>
          </div>

          <button type="button" onClick={handleSendOtp} disabled={timer > 0}>
            {otpSent ? (timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP') : 'Send OTP'}
          </button>

          {otpSent && (
            <div className="input-group">
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} required />
              <label>Enter OTP</label>
              <i className="fas fa-key input-icon-right"></i>
            </div>
          )}

          <button type="submit" disabled={!otpSent}>Login</button>
          <p><Link to="/reset-password">Forgot Password?</Link></p>
        </form>
      </div>
    </div>
  );
}

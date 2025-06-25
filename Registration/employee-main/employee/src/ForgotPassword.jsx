import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';
import './Form.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!email) return alert('Please enter your email first.');
    try {
      const response = await fetch('http://localhost:5000/api/intern/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ OTP sent to your email.');
        setTimer(60);
      } else {
        alert(result.message || '❗ Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      alert('❗ Error sending OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !newPassword || !otp) return alert('❗ Please fill all fields.');
    try {
      const response = await fetch('http://localhost:5000/api/intern/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, otp }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ Password reset successfully.');
        navigate('/login-intern');
      } else {
        alert(result.message || '❗ Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      alert('❗ Error resetting password.');
    }
  };

  return (
    <div
      className="app"
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
      <div className="form-container">
        <div className="header-row">
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="logo-img" />
          </div>
          <h2 className="reset-title">MAESTROMINDS</h2>
        </div>
        <br /><br />
        <form onSubmit={handleResetPassword}>
          {/* Email with Icon */}
          <div className="input-group">
            <input
              type="email"
              name="identifier"     
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email</label>
            <span className="input-icon-right"><FaEnvelope color="grey" /></span>
          </div>

          {/* New Password with Eye Icon */}
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label>New Password</label>
            <span
              className="input-icon-right"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash color="grey" /> : <FaEye color="grey" />}
            </span>
          </div>

          {/* Send OTP Button */}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={timer > 0}
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
          </button>

          {/* OTP Input with Key Icon */}
          <div className="input-group">
            <input
              type="text"
              name="otp"
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <label>Enter OTP</label>
            <span className="input-icon-right"><FaKey color="grey" /></span>
          </div>

          <button type="submit" >
            Reset Password
          </button>
        </form>

        <Link to="/login-intern" >
          Back to Login
        </Link>
      </div>
    </div>
  );  
};

export default ResetPassword;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '',
    newPassword: '',
    otp: ''
  });

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
  const isMobile = (value) => /^[6-9]\d{9}$/.test(value);

  const handleSendOtp = async () => {
    const id = formData.identifier.trim();
    if (!isEmail(id) && !isMobile(id)) {
      return alert('Please enter a valid Email or 10-digit Mobile number');
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/requestResetOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: id,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setOtpSent(true);
        setTimer(30);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const { identifier, newPassword, otp } = formData;
    if (!identifier || !newPassword || !otp) {
      return alert('Please fill all fields correctly.');
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier,otp })
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Password reset failed');
    }
  };

  return (
    <div className="app" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="form-container">
        <div className="header-row">
          <div className="logo"><img src="/logo.png" alt="Logo" className="logo-img" /></div>
          <h2 className="reset-title">MAESTROMINDS</h2>
        </div>
        <form onSubmit={handleReset}>
          <div className="input-group">
            <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required />
            <label>Email or Mobile</label>
            <i className="fas fa-user input-icon-right"></i>
          </div>

          <div className="input-group">
            <input type={showPassword ? 'text' : 'password'} name="newPassword" value={formData.newPassword} onChange={handleChange} required />
            <label>New Password</label>
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

          <button type="submit">Reset Password</button>
          <p><Link to="/login">Back to Login</Link></p>
        </form>
      </div>
    </div>
  );
}

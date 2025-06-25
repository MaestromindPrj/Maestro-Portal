import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    email: '',
    password: '',
    otp: ''
  });

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employee/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setOtpSent(true);
        setTimer(30);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to send OTP.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/employee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          mobile: formData.mobile,
          email: formData.email, // Used for email
          password: formData.password,
          otp: formData.otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || '🎉 Registration Successful!');
        navigate('/login-employee');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      alert('Registration failed');
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
          <h2 className="register-title">MAESTROMINDS</h2>
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label>Full Name</label>
            <i className="fas fa-user input-icon-right"></i>
          </div>

          <div className="input-group">
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
            <label>Age</label>
            <i className="fas fa-calendar input-icon-right"></i>
          </div>

          <div className="input-group">
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
            <label>Mobile Number</label>
            <i className="fas fa-phone input-icon-right"></i>
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Email</label>
            <i className="fas fa-envelope input-icon-right"></i>
          </div>

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
              className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} input-icon-right`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={timer > 0}
            style={{ backgroundColor: timer > 0 ? '#ccc' : '#f15a08' }}
          >
            {otpSent ? (timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP') : 'Send OTP'}
          </button>

          {otpSent && (
            <div className="input-group">
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
              />
              <label>Enter OTP</label>
              <i className="fas fa-key input-icon-right"></i>
            </div>
          )}

          <button type="submit">Register</button>
          <p>Already have an account? <Link to="/login-employee">Login</Link></p>
        </form>
      </div>
    </div>
  );
}

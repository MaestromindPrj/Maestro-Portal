import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Form.css';
import { useNavigate } from 'react-router-dom';

import './Form.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    college: '',
    year: '',
    email: '',
    password: '',
    resume: null,
    aadhar: null,
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return alert('❗ Please enter your email to receive OTP.');

    try {
      const response = await fetch('http://localhost:5000/api/intern/send-otp', {
        
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('✅ OTP sent to your email!');
        setIsOtpSent(true);
        setTimer(50);
      } else {
        alert(result.message || '❗ Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      alert('❗ Error sending OTP');
    }
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  if (!otp) return alert('❗ Please enter OTP before registering.');

  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    data.append(key, value);
  });
  data.append('identifier', formData.email);  // ✅ REQUIRED for OTP validation
  data.append('otp', otp);

  try {
    const response = await fetch('http://localhost:5000/api/intern/register', {
      method: 'POST',
      body: data,
    });

    const result = await response.json();

    if (response.ok) {
      alert('🎉 Registration Successful!');
      navigate('/login-intern');
    } else {
      alert(result.message || '❗ Registration Failed');
    }
  } catch (error) {
    console.error(error);
    alert('❗ Error submitting form');
  }
};


  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && isOtpSent) {
      setIsOtpSent(false);
    }
    return () => clearInterval(interval);
  }, [timer, isOtpSent]);

  /*const renderInputWithIcon = (type, name, placeholder, IconComponent, required = true) => (
    <div className="input-with-icon">
      <span className="input-icon"><IconComponent color="grey" /></span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        value={formData[name]}
        onChange={handleChange}
      />
    </div>
  );*/

return (
  <div
    className="app"
    style={{
      backgroundImage: "url('/background.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="form-container">
      <div className="header-row">
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="logo-img" />
        </div>
        <h2 className="register-title-int">MAESTROMINDS</h2>
      </div>

      <form onSubmit={handleRegister} encType="multipart/form-data">
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
            type="tel"
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
            type="text"
            name="college"
            value={formData.college}
            onChange={handleChange}
            required
          />
          <label>College Name</label>
          <i className="fas fa-graduation-cap input-icon-right"></i>
        </div>

        <div className="input-group">
          <select
            name="year"
            value={formData.year}
            required
            onChange={handleChange}
          >
            <option value="">Select Year of Study</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
          <i className="fas fa-book input-icon-right"></i>
        </div>

        <div className="input-file-group">
          <label>Resume (PDF/DOC)</label>
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            required
            onChange={handleChange}
          />
        </div>

        <div className="input-file-group">
          <label>Aadhaar (PDF/Image)</label>
          <input
            type="file"
            name="aadhar"
            accept=".pdf,.jpg,.jpeg,.png"
            required
            onChange={handleChange}
          />
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
          disabled={isOtpSent}
          style={{ backgroundColor: timer > 0 ? '#ccc' : '#f15a08' }}
        >
          {isOtpSent ? (timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP') : 'Send OTP'}
        </button>

        {isOtpSent && (
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <label>OTP</label>
            <i className="fas fa-key input-icon-right"></i>
          </div>
        )}

        <button type="submit">Register</button>
        <p>
          Already have an account? <Link to="/login-intern">Login</Link>
        </p>
      </form>
    </div>
  </div>
);
}

export default RegistrationForm;
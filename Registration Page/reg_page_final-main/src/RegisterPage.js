import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase/firebaseConfig';
import './Form.css';
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendVerification = async () => {
    setLoading(true);
    setMessage('');

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await sendEmailVerification(userCredential.user);

      // Save necessary data to localStorage
      localStorage.setItem('employee_data', JSON.stringify({
        uid: userCredential.user.uid,
        name: formData.name,
        age: formData.age,
        mobile: formData.mobile,
        email: formData.email,
      }));

      setMessage('✅ Verification email sent. Please check your inbox or spam.');
      setEmailSent(true);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error sending verification email.');
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const currentUser = auth.currentUser;
      await currentUser.reload(); // 🔄 force refresh user info

      if (!currentUser.emailVerified) {
        setMessage('❗ Please verify your email before registering.');
        setLoading(false);
        return;
      }

      const employeeData = JSON.parse(localStorage.getItem('employee_data'));

      await setDoc(doc(db, 'employees', currentUser.uid), {
        ...employeeData,
        createdAt: new Date(),
      });

      localStorage.removeItem('employee_data');
      setMessage('✅ Registered successfully. Redirecting...');
      setTimeout(() => navigate('/login-employee'), 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Registration failed.');
    }

    setLoading(false);
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
            <FaUser className="input-icon-right" />
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
            <FaCalendar className="input-icon-right" />
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
            <FaPhone className="input-icon-right" />
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
            <FaEnvelope className="input-icon-right" />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <label>Password</label>
            {showPassword ? (
              <FaEyeSlash
                className="input-icon-right"
                onClick={() => setShowPassword(false)}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <FaEye
                className="input-icon-right"
                onClick={() => setShowPassword(true)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </div>

          <button type="button" onClick={handleSendVerification} disabled={emailSent || loading}>
            {emailSent ? 'Verification Sent' : 'Send Verification Email'}
          </button>

          <button type="submit" disabled={!emailSent || loading}>
            Register
          </button>

          {message && <p className="message">{message}</p>}
</form>
          <p>
            Already have an account? <Link to="/login-employee">Login</Link>
          </p>
        
      </div>
    </div>
  );
}

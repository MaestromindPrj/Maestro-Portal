import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import './Form.css';
import { Link, useLocation } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const isIntern = location.pathname.includes('intern');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('✅ Reset email sent. Check your inbox or spam.');
    } catch (err) {
      setMessage(err.message);
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
          <h2 className="login-title">MAESTROMINDS</h2>
        </div>

        

        <form onSubmit={handleReset}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
            <FaEnvelope className="input-icon-right" />
          </div>

          <button type="submit">Send Reset Link</button>

          {message && <p className="message">{message}</p>}
          </form>
          <p>
            <Link to={isIntern ? '/login-intern' : '/login-employee'}>Back to Login</Link>
          </p>
        
      </div>
    </div>
  );
};

export default ForgotPassword;

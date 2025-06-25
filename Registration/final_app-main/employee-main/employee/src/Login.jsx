import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/intern/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  identifier: identifier.trim(),
  password,
})
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token); 
        alert('✅ Login Successful!');
        navigate('/dashboard');
      } else {
        alert(result.message || '❗ Login Failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('❗ An error occurred during login');
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
        <br></br>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              name="identifier"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <label>Email or Mobile Number</label>
            <span className="input-icon-right"><FaUser color="grey" /></span>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}

              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <span
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash color="grey" /> : <FaEye color="grey" />}
            </span>
          </div>

          <button type="submit" className="login-btn">Log in</button>
        </form>

        <p><Link to="/forgot-password-intern">Forgot Password?</Link></p>
        <p>Don't have an account? <Link to="/register-intern">Register here</Link></p>
      </div>
    </div>
  );
};

export default Login;

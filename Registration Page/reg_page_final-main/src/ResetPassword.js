import React, { useState, useEffect } from 'react';
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode
} from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import './Form.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isIntern = location.pathname.includes('intern');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false); // for password reset

  useEffect(() => {
    const handleMode = async () => {
      if (!oobCode || !mode) {
        setMessage('❌ Invalid or missing link.');
        setLoading(false);
        return;
      }

      try {
        if (mode === 'resetPassword') {
          const userEmail = await verifyPasswordResetCode(auth, oobCode);
          setEmail(userEmail);
          setVerified(true);
        } else if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          setMessage('✅ Email verified successfully! You can now log in.');
        } else {
          setMessage('❌ Unsupported action.');
        }
      } catch (err) {
        console.error(err);
        setMessage(err.message || '❌ Link is invalid or expired.');
      }

      setLoading(false);
    };

    handleMode();
  }, [mode, oobCode]);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage('✅ Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate(isIntern ? '/login-intern' : '/login-employee'), 3000);
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to reset password.');
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
        alignItems: 'center'
      }}
    >
      <div className="form-container">
        <div className="header-row">
          <div className="logo">
            <img src="/logo.png" alt="Logo" className="logo-img" />
          </div>
          <h2 className="login-title">MAESTROMINDS</h2>
        </div>

        {loading ? (
          <p>🔄 Processing...</p>
        ) : (
          <>
            {mode === 'resetPassword' && verified ? (
              <form onSubmit={handleReset}>
                <p>Email: <strong>{email}</strong></p>

                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label>New Password</label>
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? <FaEyeSlash color="grey" /> : <FaEye color="grey" />}
                  </span>
                </div>

                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <label>Confirm Password</label>
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? <FaEyeSlash color="grey" /> : <FaEye color="grey" />}
                  </span>
                </div>

                <button type="submit">Reset Password</button>
                {message && <p className="message">{message}</p>}
              </form>
            ) : (
              <p className="message">{message}</p>
            )}

            <p>
              <Link to={isIntern ? '/login-intern' : '/login-employee'}>
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

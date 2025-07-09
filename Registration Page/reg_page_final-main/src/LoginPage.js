import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmailAndPassword,signOut } from 'firebase/auth';
import { auth, db } from './firebase/firebaseConfig';
import { collection, query, where, getDocs,getDoc,doc } from 'firebase/firestore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      let emailToUse = identifier.trim();

      // 📞 If input is a mobile number, look up email in Firestore
      const isMobile = /^\d{10}$/.test(identifier);
      if (isMobile) {
        const empRef = collection(db, 'employees');
        const q = query(empRef, where('mobile', '==', identifier));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setMessage('❌ No employee found with this mobile number');
          return;
        }

        emailToUse = snapshot.docs[0].data().email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setMessage('❗ Please verify your email before logging in.');
        return;
      }

      const internDoc = await getDoc(doc(db, 'employees', user.uid));
      if (!internDoc.exists()) {
        await signOut(auth); // Not an intern, block access
        setMessage('❌ You are not registered as an employee.');
        return;
      }



      localStorage.setItem('token', await user.getIdToken());
      setMessage('✅ Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Login failed.');
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
        <br />

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              name="identifier"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <label>Email or Mobile</label>
            <span className="input-icon-right"><FaUser color="grey" /></span>
          </div>

          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <span
              className="eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FaEyeSlash color="grey" /> : <FaEye color="grey" />}
            </span>
          </div>

          <button type="submit" className="login-btn">Log in</button>
        </form>

        {message && <p className="message">{message}</p>}

        <p><Link to="/reset-password-employee">Forgot Password?</Link></p>
        <p>Don't have an account? <Link to="/register-employee">Register here</Link></p>
      </div>
    </div>
  );
}

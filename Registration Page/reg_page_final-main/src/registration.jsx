import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from './firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from './uploadToCloudinary';
import './Form.css';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaPhone, FaEnvelope, FaCalendar, FaBook, FaEye, FaEyeSlash, FaUniversity } from 'react-icons/fa';

const RegisterIntern = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userUid, setUserUid] = useState(null);

  const aadharRef = useRef();
  const resumeRef = useRef();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    college: '',
    year: '',
    aadhar: null,
    resume: null,
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      setUserUid(user.uid);
      setMessage('✅ Verification email sent. Please check your inbox or spam.');
    } catch (err) {
      console.error(err);
      setMessage(err.message || '❌ Verification failed.');
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('❗ User not authenticated. Please send verification first.');
      }

      await currentUser.reload(); // 🔄 refresh user state
      if (!currentUser.emailVerified) {
        throw new Error('❗ Please verify your email before registering.');
      }

      const aadharUrl = await uploadToCloudinary(formData.aadhar, 'intern/aadhars');
      const resumeUrl = await uploadToCloudinary(formData.resume, 'intern/resumes');

      if (!aadharUrl || !resumeUrl) {
        throw new Error('❌ Failed to upload documents.');
      }

      await setDoc(doc(db, 'interns', userUid), {
        uid: userUid,
        name: formData.name,
        age: formData.age,
        mobile: formData.mobile,
        college: formData.college,
        year: formData.year,
        aadharUrl,
        resumeUrl,
        email: formData.email,
        createdAt: new Date(),
      });

      setMessage('✅ Registered successfully. Redirecting...');
      setTimeout(() => navigate('/login-intern'), 3000);

      setFormData({
        name: '',
        age: '',
        mobile: '',
        college: '',
        year: '',
        aadhar: null,
        resume: null,
        email: '',
        password: '',
      });

      aadharRef.current.value = '';
      resumeRef.current.value = '';
    } catch (err) {
      console.error(err);
      setMessage(err.message || '❌ Registration failed.');
    }

    setLoading(false);
  };

  return (
    <div className="app" style={{ backgroundImage: "url('/background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="form-container">
        <div className="header-row">
          <div className="logo"><img src="/logo.png" alt="Logo" className="logo-img" /></div>
          <h2 className="register-title">MAESTROMINDS</h2>
        </div>

        <form>
          <div className="input-group">
            <input type="text" name="name" required value={formData.name} onChange={handleChange} />
            <label>Full Name</label>
            <FaUser className="input-icon-right" />
          </div>

          <div className="input-group">
            <input type="number" name="age" value={formData.age} onChange={handleChange} required />
            <label>Age</label>
            <FaCalendar className="input-icon-right" />
          </div>

          <div className="input-group">
            <input type="text" name="mobile" required value={formData.mobile} onChange={handleChange} />
            <label>Mobile Number</label>
            <FaPhone className="input-icon-right" />
          </div>

          <div className="input-group">
            <input type="text" name="college" required value={formData.college} onChange={handleChange} />
            <label>College Name</label>
            <FaUniversity className="input-icon-right" />
          </div>

          <div className="input-group">
            <select name="year" value={formData.year} required onChange={handleChange}>
              <option value="">Select Year of Study</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
            <FaBook className="input-icon-right" />
          </div>

          <div className="input-file-group">
            <label>Upload Aadhaar (PDF/Image)</label>
            <input ref={aadharRef} type="file" name="aadhar" accept="application/pdf,image/*" onChange={handleChange} required />
          </div>

          <div className="input-file-group">
            <label>Upload Resume (PDF/DOC)</label>
            <input ref={resumeRef} type="file" name="resume" accept="application/pdf,.doc,.docx" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
            <label>Email</label>
            <FaEnvelope className="input-icon-right" />
          </div>

          <div className="input-group">
            <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} />
            <label>Password</label>
            {showPassword ? (
              <FaEyeSlash className="input-icon-right" onClick={() => setShowPassword(false)} style={{ cursor: 'pointer' }} />
            ) : (
              <FaEye className="input-icon-right" onClick={() => setShowPassword(true)} style={{ cursor: 'pointer' }} />
            )}
          </div>

          <button type="button" onClick={handleVerify} disabled={loading || userUid}>
            {userUid ? 'Verification Sent' : 'Send Verification Email'}
          </button>

          <button type="submit" onClick={handleRegister} disabled={loading || !userUid}>
            Register
          </button>

          {message && <p className="message">{message}</p>}
          </form>
          <p>Already have an account? <Link to="/login-intern">Login</Link></p>
        
      </div>
    </div>
  );
};

export default RegisterIntern;

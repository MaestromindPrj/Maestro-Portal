import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './MainPage';

// ✅ Employee components
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

// ✅ Intern components
import Login from './Login';
import Registration from './registration';

// ✅ Shared
import Dashboard from './dashboard';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword'; // ✅ Unified reset password page

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<MainPage />} />

        {/* Employee Auth */}
        <Route path="/login-employee" element={<LoginPage />} />
        <Route path="/register-employee" element={<RegisterPage />} />
        <Route path="/reset-password-employee" element={<ForgotPassword />} />

        {/* Intern Auth */}
        <Route path="/login-intern" element={<Login />} />
        <Route path="/register-intern" element={<Registration />} />
        <Route path="/reset-password-intern" element={<ForgotPassword />} />

        {/* Shared Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}

export default App;

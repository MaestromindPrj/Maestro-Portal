import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainPage from './MainPage'; 
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ResetPasswordPage from './ResetPasswordPage';
import DashboardPage from './DashboardPage';

// ✅ Intern Pages (Added without changing structure)
import Login from './Login';            // Intern Login Page
import Registration from './Registration';  // Intern Registration Page
import ForgotPassword from './ForgotPassword'; // Intern Forgot Password Page
import Dashboard from './dashboard';    // Intern Dashboard Page

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Main landing page */}
        <Route path="/" element={<MainPage />} />

        {/* ✅ Employee routes */}
        <Route path="/login-employee" element={<LoginPage userType="employee" />} />
        <Route path="/register-employee" element={<RegisterPage userType="employee" />} />

        {/* ✅ Intern routes */}
        <Route path="/login-intern" element={<Login />} />
        <Route path="/register-intern" element={<Registration />} />
        <Route path="/forgot-password-intern" element={<ForgotPassword />} />
        <Route path="/dashboard-intern" element={<Dashboard />} />

        {/* ✅ Shared pages */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import ReactDOM from "react-dom/client";
import ScrollToTop from "./utilities/ScrollToTop";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLandingPage from "./Admin/Admin_Landing/AdminLandingPage";
import InternLandingPage from "./Intern_Employee/Landing/InternLandingPage";
import AdminMaestroHub from "./Admin/Admin_Course/AdminCoursePage";
import InternMaestroHub from "./Intern_Employee/Course/InternCoursePage";

const userRole = "admin"; // or wherever you store role

const LandingPage = userRole === "admin" ? AdminLandingPage : InternLandingPage;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/course/:id" element={<InternMaestroHub />} />
        <Route path="/admincourse/:id" element={<AdminMaestroHub />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './sidebar.css';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed && (
        <ul>
          <li className={isActive('/') ? 'active' : ''}>
            <Link to="/">🏠 Home</Link>
          </li>
          <li className={isActive('/time-tracker') ? 'active' : ''}>
            <Link to="/time-tracker">⏱ Time Tracker</Link>
          </li>
          <li className={isActive('/project-tracker') ? 'active' : ''}>
            <Link to="/project-tracker">📊 Project Tracker</Link>
          </li>
          <li className={isActive('/learning-hub') ? 'active' : ''}>
            <Link to="/learning-hub">📚 Learning Hub</Link>
          </li>
        </ul>
      )}
      <button className="collapse-btn" onClick={toggleSidebar}>
        {collapsed ? '>>>' : '<<<'}
      </button>
    </div>
  );
}

export default Sidebar;

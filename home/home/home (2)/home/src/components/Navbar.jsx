import React, { useState } from 'react';
import { FaPlusCircle, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';
import AddPostModal from '../components/AddPostModal';

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  return (
    <div className="navbar">
      <div className="navbar-center">
        <img
          src="/mlogo.jpg"
          alt="Logo"
          className="logo-img"
        />
        <h1 className="navbar-title">MaestroMinds</h1>
      </div>

      <div className="navbar-right">
        <div
          className="dropdown"
          onMouseEnter={() => setShowMenu(false)}

        >
          <FaPlusCircle className="plus-icon" onClick={() => setPostModalOpen(true)} />

          <AddPostModal
            isOpen={isPostModalOpen}
            onClose={() => setPostModalOpen(false)}
          />
          {showMenu && (
            <div className="dropdown-content">
              <div className="top-buttons">


                {/* other content */}
              </div>


            </div>
          )}
        </div>
        <button className="profile-btn">
          <FaUserCircle className="profile-icon" />
        </button>
      </div>
    </div>
  );
}

export default Navbar;


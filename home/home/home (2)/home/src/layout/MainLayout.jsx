import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/sidebar';
import RightSidebar from '../components/RightSidebar';  // <-- Add this

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ display: 'center', marginTop: '70px' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '220px', marginRight: '220px', padding: '20px 30px' }}>
          {children}
        </div>
        <RightSidebar />
      </div>
    </>
  );
}

export default MainLayout;



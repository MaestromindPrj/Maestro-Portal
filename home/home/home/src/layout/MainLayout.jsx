import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/sidebar';

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ display: 'center', marginTop: '70px' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '220px', marginRight: '220px', padding: '20px 30px' }}>
          {children}
        </div>
      </div>
    </>
  );
}

export default MainLayout;

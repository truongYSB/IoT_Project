import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Common/Navbar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="app-wrapper">
      {/* Navbar hiển thị ở trên cùng mọi trang */}
      <header className="main-header">
        <Navbar />
      </header>

      {/* Nội dung thay đổi theo từng trang */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
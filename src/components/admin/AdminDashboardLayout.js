import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './AdminDashboardLayout.css';

const AdminDashboardLayout = ({ children }) => (
  <div className="admin-dashboard-layout">
    <Header />
    <Sidebar />
    <main className="admin-dashboard-content">
      {children}
    </main>
  </div>
);

export default AdminDashboardLayout;

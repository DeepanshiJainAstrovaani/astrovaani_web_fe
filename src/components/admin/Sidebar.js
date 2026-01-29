import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => (
  <aside className="admin-sidebar">
    <nav>
      <ul>
        <li><NavLink to="/admin/vendors" className={({ isActive }) => isActive ? "active" : ""}>Vendors</NavLink></li>
        <li><NavLink to="/admin/customers" className={({ isActive }) => isActive ? "active" : ""}>Customers</NavLink></li>
        <li><NavLink to="/admin/bookings" className={({ isActive }) => isActive ? "active" : ""}>Bookings</NavLink></li>
        <li><NavLink to="/admin/interviews" className={({ isActive }) => isActive ? "active" : ""}>Interviews</NavLink></li>
        <li><NavLink to="/admin/payments" className={({ isActive }) => isActive ? "active" : ""}>Payments</NavLink></li>
        <li><NavLink to="/admin/offers" className={({ isActive }) => isActive ? "active" : ""}>Offers & Discounts</NavLink></li>
        <li><NavLink to="/admin/notifications" className={({ isActive }) => isActive ? "active" : ""}>Notifications</NavLink></li>
        <li><NavLink to="/admin/blog" className={({ isActive }) => isActive ? "active" : ""}>Blog</NavLink></li>
        <li><NavLink to="/admin/enquiries" className={({ isActive }) => isActive ? "active" : ""}>Enquiries</NavLink></li>
        <li><NavLink to="/admin/vendor-agreement" className={({ isActive }) => isActive ? "active" : ""}>Vendor Agreement</NavLink></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => (
  <aside className="admin-sidebar">
    <nav>
      <ul>
        <li><NavLink to="/admindashboard/vendors" className={({ isActive }) => isActive ? "active" : ""}>Vendors</NavLink></li>
        <li><NavLink to="/admindashboard/customers" className={({ isActive }) => isActive ? "active" : ""}>Customers</NavLink></li>
        <li><NavLink to="/admindashboard/bookings" className={({ isActive }) => isActive ? "active" : ""}>Bookings</NavLink></li>
        <li><NavLink to="/admindashboard/interviews" className={({ isActive }) => isActive ? "active" : ""}>Interviews</NavLink></li>
        <li><NavLink to="/admindashboard/payments" className={({ isActive }) => isActive ? "active" : ""}>Payments</NavLink></li>
        <li><NavLink to="/admindashboard/offers" className={({ isActive }) => isActive ? "active" : ""}>Offers & Discounts</NavLink></li>
        <li><NavLink to="/admindashboard/notifications" className={({ isActive }) => isActive ? "active" : ""}>Notifications</NavLink></li>
        <li><NavLink to="/admindashboard/blog" className={({ isActive }) => isActive ? "active" : ""}>Blog</NavLink></li>
        <li><NavLink to="/admindashboard/enquiries" className={({ isActive }) => isActive ? "active" : ""}>Enquiries</NavLink></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;

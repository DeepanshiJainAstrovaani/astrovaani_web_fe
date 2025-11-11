import React from 'react';
import './Header.css';
import logo from '../../assets/logo_dark.png'; // Update path if your logo is elsewhere

const Header = () => (
  <header className="admin-header">
    <div className="admin-header__logo-area">
      <img src={logo} alt="Astrovaani Logo" className="admin-header__logo-img" />
    </div>
    <div className="admin-header__right">
      <span className="admin-header__welcome">Welcome, Admin</span>
      <button className="admin-header__logout" onClick={() => {
        localStorage.removeItem('isAdmin');
        window.location.href = '/admindashboard/login';
      }}>Logout</button>
    </div>
  </header>
);

export default Header;

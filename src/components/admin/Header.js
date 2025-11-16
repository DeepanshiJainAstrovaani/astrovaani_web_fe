import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';
import logo from '../../assets/logo_dark.png';

const Header = () => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header__logo-area">
        <img src={logo} alt="Astrovaani Logo" className="admin-header__logo-img" />
      </div>
      <div className="admin-header__right">
        <span className="admin-header__welcome">
          Welcome, {admin?.name || 'Admin'}
        </span>
        <button className="admin-header__logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

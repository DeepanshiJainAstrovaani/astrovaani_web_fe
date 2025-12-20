import React from 'react';
import apple from '../assets/apple.png';
import playstore from '../assets/playstore.png';
import logo from '../assets/logo_dark.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="Astrovaani Logo" height="50" />
        </div>
        
        <h3 className="footer-title">Download App to get 1st Chat free with every astrologer</h3>
        
        <div className="footer-download-btns">
          <a href="#" className="footer-download-btn">
            <img src={apple} alt="App Store" height="38" />
            <span>
              <span className="footer-download-label">Download on</span>
              <span className="footer-store-label">App Store</span>
            </span>
          </a>
          <a href="#" className="footer-download-btn">
            <img src={playstore} alt="Play Store" height="38" />
            <span>
              <span className="footer-download-label">Download on</span>
              <span className="footer-store-label">Play Store</span>
            </span>
          </a>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-links">
          <a href="/terms" className="footer-link">Terms</a>
          <a href="/policy" className="footer-link">Policy</a>
          <a href="/contact" className="footer-link">Contact Us</a>
          <a href="/help" className="footer-link">Help</a>
        </div>

        <p className="footer-copyright">Rights Reserved By Astrovaani @ 2025</p>
      </div>
    </footer>
  );
};

export default Footer;

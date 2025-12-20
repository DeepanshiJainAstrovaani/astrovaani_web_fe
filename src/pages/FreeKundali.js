import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import astrologer from '../assets/astrologer.png';
import './FreeKundali.css';

const FreeKundali = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    placeOfBirth: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="kundali-page">
      {/* Header */}
      <header className="kundali-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="header-brand">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="header-title">Astrovaani</span>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="kundali-hero">
        <div className="hero-content">
          <h1 className="hero-title">Free Kundali</h1>
          <p className="hero-subtitle">Check your birth chart at free of cost</p>
        </div>
        <div className="hero-image">
          <img src={astrologer} alt="Astrologer" />
        </div>
      </section>

      {/* Form Section */}
      <section className="kundali-form-section">
        <form className="kundali-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="birthDate">Birth Date</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                placeholder="Select birth date"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthTime">Birth time</label>
              <input
                type="time"
                id="birthTime"
                name="birthTime"
                placeholder="Enter time of your birth"
                value={formData.birthTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="placeOfBirth">Place of Birth</label>
              <input
                type="text"
                id="placeOfBirth"
                name="placeOfBirth"
                placeholder="Enter place of your birth"
                value={formData.placeOfBirth}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <p className="form-note">
            Make sure all the details your provide should be correct. Accuracy of your birth chart depends on the details you provide.
          </p>

          <button type="submit" className="generate-btn">
            Generate
          </button>
        </form>
      </section>

      {/* Download App Section */}
      <section className="download-app-section">
        <h2 className="download-title">Download app to connect with Astrologer</h2>
        <div className="download-buttons">
          <a href="#" className="store-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
            </svg>
            <span>
              <span className="store-label-small">Download on</span>
              <span className="store-label-large">App Store</span>
            </span>
          </a>
          <a href="#" className="store-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
            <span>
              <span className="store-label-small">Download on</span>
              <span className="store-label-large">Play Store</span>
            </span>
          </a>
        </div>
      </section>

      {/* Footer Section - Outside purple section */}
      <section className="footer-section">
        <div className="footer-links-inline">
          <a href="/terms">Terms</a>
          <a href="/policy">Policy</a>
          <a href="/help">Help</a>
        </div>

        <p className="copyright">Rights Reserved By Astrovaani @ 2025</p>
      </section>
    </div>
  );
};

export default FreeKundali;

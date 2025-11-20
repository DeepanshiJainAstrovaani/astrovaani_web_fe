import React from 'react';
import apple from '../assets/apple.png';
import playstore from '../assets/playstore.png';
import astrologer from '../assets/astrologer.png';
import logo from '../assets/logo.png';
import '../assets/home.css';

const Home = () => (
  <div>
    {/* Custom Navbar */}
    <nav className="astro-navbar">
      <a href="/" className="brand">Astrovaani</a>
      <div className="menu">
        <a href="/horoscope">Horoscope</a>
        <a href="/how-to-use">How to use</a>
        <a href="/joinus">Join Astrovaani</a>
        <a href="/free-kundali">Free Kundali</a>
      </div>
    </nav>

    {/* Hero Section */}
    <section className="hero-section">
      <div className="astro-logo">
        <img src={logo} alt="Astrovaani Logo" height="110" />
      </div>
      <h1>Connect with India’s best astrologers</h1>
      <p>Book your consultation to ask your questions related with relationship, career, health, business or marriage</p>
      <div className="download-btns">
        <a href="#" className="download-btn">
          <img src={apple} alt="App Store" height="38" />
          <span>
            <span className="download-label">Download on</span>
            <span className="store-label">App Store</span>
          </span>
        </a>
        <a href="#" className="download-btn">
          <img src={playstore} alt="Play Store" height="38" />
          <span>
            <span className="download-label">Download on</span>
            <span className="store-label">Play Store</span>
          </span>
        </a>
      </div>
      <div>
        <img src={astrologer} alt="Astrologer" height="400" className="astro-img" />
      </div>
    </section>

    {/* Daily Horoscope Section */}
    <section className="horoscope-section">
      <h2 className="horoscope-title">Daily Horoscope</h2>
      <p className="horoscope-subtitle">Read your today horoscope</p>
      <div className="horoscope-grid">
        {[
          { name: 'Aries', date: '21 Mar - 19 Apr', img: require('../assets/aries.png') },
          { name: 'Tauras', date: '20 Apr - 20 May', img: require('../assets/tauras.png') },
          { name: 'Gemini', date: '21 May - 20 Jun', img: require('../assets/gemini.png') },
          { name: 'Cancer', date: '21 Jun - 22 Jul', img: require('../assets/cancer.png') },
          { name: 'Leo', date: '23 Jul - 22 Aug', img: require('../assets/leo.png') },
          { name: 'Virgo', date: '23 Aug - 22 Sep', img: require('../assets/virgo.png') },
          { name: 'Libra', date: '23 Sep - 22 Oct', img: require('../assets/libra.png') },
          { name: 'Scorpio', date: '23 Oct - 21 Nov', img: require('../assets/scorpio.png') },
          { name: 'Sagittarius', date: '22 Nov - 21 Dec', img: require('../assets/sagittarius.png') },
          { name: 'Capricorn', date: '22 Dec - 19 Jan', img: require('../assets/capricorn.png') },
          { name: 'Aquarius', date: '20 Jan - 18 Feb', img: require('../assets/aquarius.png') },
          { name: 'Pisces', date: '19 Feb - 20 Mar', img: require('../assets/pisces.png') },
        ].map((zodiac) => (
          <div className="zodiac-card" key={zodiac.name}>
            <div className="zodiac-img-wrap">
              <img src={zodiac.img} alt={zodiac.name} />
            </div>
            <div className="zodiac-name">{zodiac.name}</div>
            <div className="zodiac-date">{zodiac.date}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;

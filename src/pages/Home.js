import React from 'react';
import apple from '../assets/apple.png';
import playstore from '../assets/playstore.png';
import astrologer from '../assets/astrologer.png';
import logo from '../assets/logo.png';
import blogs from '../assets/blogs.png';
import Footer from '../components/Footer';
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

    {/* How to Book Consultation Section */}
    <section className="consultation-section">
      <h2 className="consultation-title">How to book consultation</h2>
      <p className="consultation-subtitle">Follow 3 easy steps to talk with astrologer</p>
      <div className="steps-container">
        <div className="step-card">
          <div className="step-phone">
            <div className="phone-frame"></div>
          </div>
          <div className="step-number">1</div>
          <p className="step-text">Choose an astrologer</p>
        </div>
        <div className="step-card">
          <div className="step-phone">
            <div className="phone-frame"></div>
          </div>
          <div className="step-number">2</div>
          <p className="step-text">Fill the details</p>
        </div>
        <div className="step-card">
          <div className="step-phone">
            <div className="phone-frame"></div>
          </div>
          <div className="step-number">3</div>
          <p className="step-text">Choose duration</p>
        </div>
      </div>
    </section>

    {/* Latest from Blog Section */}
    <section className="blog-section">
      <h2 className="blog-title">Latest from blog</h2>
      <p className="blog-subtitle">Read interesting stories and articles</p>
      <div className="blog-grid">
        <div className="blog-card">
          <div className="blog-image">
            <img src={blogs} alt="Blog" />
          </div>
          <h3 className="blog-card-title">Top 4 Zodiac Signs That Are Always Honest (Even When It Hurts)</h3>
          <p className="blog-date">16 December 2024</p>
        </div>
        <div className="blog-card">
          <div className="blog-image">
            <img src={blogs} alt="Blog" />
          </div>
          <h3 className="blog-card-title">Top 4 Zodiac Signs That Are Always Honest (Even When It Hurts)</h3>
          <p className="blog-date">16 December 2024</p>
        </div>
        <div className="blog-card">
          <div className="blog-image">
            <img src={blogs} alt="Blog" />
          </div>
          <h3 className="blog-card-title">Top 4 Zodiac Signs That Are Always Honest (Even When It Hurts)</h3>
          <p className="blog-date">16 December 2024</p>
        </div>
      </div>
      <button className="read-more-btn">Read more articles</button>
    </section>

    {/* Join Astrovaani Section */}
    <section className="join-section">
      <h2 className="join-title">Join Astrovaani</h2>
      <p className="join-subtitle">As an astrologer, numerologist or tarot reader</p>
      <a href="/joinus" className="join-btn">Join now</a>
    </section>

    {/* Astrology Information Section */}
    <section className="info-section">
      <div className="info-content">
        <h2 className="info-title">How Astrology effects your life?</h2>
        <p className="info-text">
          Astrology affects your life by explaining how the positions and movements of planets, stars, and zodiac signs at the time of your birth influence your personality, emotions, and destiny. Every individual has a unique birth chart (Kundali) that reflects the alignment of celestial bodies such as the Sun, Moon, Mars, Mercury, Venus, Jupiter, Saturn, Rahu, and Ketu. These planets represent different energies that shape your thoughts, behavior, career choices, relationships, and overall life direction.
        </p>
        <p className="info-text">
          For example, Mercury governs communication and intellect, Venus represents love and creativity, Mars signifies courage and action, while Saturn brings discipline, karma, and life lessons. When these planets move through different zodiac signs (a process called planetary transit), they create new opportunities or challenges depending on your astrological chart. This is why astrology is used to predict career growth, marriage timing, financial success, health patterns, and other important life events.
        </p>
        <p className="info-text">
          Astrology doesn't control your life but helps you understand your strengths, weaknesses, and timing of events. By studying your horoscope, you can make well-informed decisions that align with cosmic energy. It offers a deeper sense of self-awareness, purpose, and direction, guiding you toward personal and spiritual growth.
        </p>
        <p className="info-text">
          Modern astrology combines Vedic wisdom with psychological insights, helping you recognize patterns and make mindful choices rather than relying on fate. Whether you seek career astrology, relationship astrology, or daily horoscope guidance, astrology empowers you to live consciously and harmoniously with universal energies.
        </p>

        <h3 className="info-subtitle">Why matching kundali is important before getting married?</h3>
        <p className="info-text">
          Matching Kundali (horoscope) before marriage is one of the most essential steps in Vedic astrology to ensure a happy, stable, and harmonious relationship. It helps assess the astrological compatibility between two individuals based on their birth charts (Janam Kundali). The process, known as Kundali Milan or Gun Milan, compares planetary positions and evaluates how well the couple's energies align in terms of emotional, mental, and physical compatibility.
        </p>
        <p className="info-text">
          During Kundali matching, eight major aspects — called Ashta Koota — are analyzed. These include Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi. Together, they contribute to a total of 36 Gunas (points). A higher score, generally 18 or more, indicates good compatibility, while a lower score suggests potential challenges in the marriage.
        </p>
        <p className="info-text">
          Kundali matching also helps identify Doshas such as Mangal Dosha (Kuja Dosha) or Shani Dosha, which can cause conflicts, delay in marriage, or health issues after marriage if not properly balanced. Through astrological remedies and counseling, these effects can be minimized for a smoother relationship.
        </p>
        <p className="info-text">
          Beyond emotional compatibility, Kundali matching analyzes financial stability, health harmony, family happiness, and longevity of the relationship. It offers a logical and spiritual perspective, ensuring that two people are not only emotionally connected but also cosmically aligned for a prosperous married life. In today's modern world, where relationships face multiple challenges, Kundali matching serves as a guiding tool for building a strong foundation of trust, understanding, and mutual respect.
        </p>

        <h3 className="info-subtitle">The Final Answer! Why you need astrology?</h3>
        <p className="info-text">
          Astrology is not just about predicting the future — it's about understanding ourselves on a deeper level. In today's fast-paced and stressful world, astrology acts as a guiding light that helps us find clarity, direction, and peace of mind. It connects us with the rhythm of the universe and reveals how cosmic energies influence our emotions, relationships, and decisions. Through the study of planets, zodiac signs, and kundali, astrology gives us insights into our strengths, weaknesses, and life purpose.
        </p>
        <p className="info-text">
          Many people turn to astrology during confusion or pain because it provides emotional comfort and logical explanations for life's patterns. It helps us make better choices in career, marriage, health, and personal growth by aligning our actions with favorable planetary periods. Rather than being superstitious, astrology is a blend of science, psychology, and spirituality that brings awareness to our karmic path.
        </p>
        <p className="info-text">
          In essence, we need astrology because it helps us understand who we are and where we are headed. It empowers us to live consciously, make wiser decisions, and stay emotionally balanced. Astrology reminds us that every challenge and blessing is part of a divine plan — guiding us toward our true destiny.
        </p>
      </div>
    </section>

    {/* Footer */}
    <Footer />
  </div>
);

export default Home;

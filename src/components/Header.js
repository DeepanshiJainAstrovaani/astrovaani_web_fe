
import React from 'react';
import styles from './Header.module.css';
import logoDark from '../assets/logo_dark.png';

export default function Header() {
  return (
    <header className={styles.headerBg}>
      <div className={styles.headerContainer}>
        <img src={logoDark} alt="Astrovaani Logo" style={{ width: '10rem', height: 'auto' }} />
      </div>
    </header>
  );
}

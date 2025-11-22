import React from 'react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.headerBg}>
      <div className={styles.headerContainer}>
        <img src="/assets/dark_logo.png" alt="Astrovaani Logo" className={styles.logo} />
      </div>
    </header>
  );
}

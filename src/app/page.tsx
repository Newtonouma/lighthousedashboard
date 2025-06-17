'use client';
import React from 'react';
import Link from 'next/link';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <main className={styles.heroWrapper}>
      <div className={styles.heroBgDecor} />
      <section className={styles.heroContent}>
        <div className={styles.logoCircle}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#22c55e" /><path d="M24 12v24M12 24h24" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
        </div>
        <h1 className={styles.heroTitle}>Welcome to Lighthouse Dashboard</h1>
        <p className={styles.heroSubtitle}>
          Your all-in-one platform to manage content, events, teams, and more. Designed for clarity, speed, and delight.
        </p>
        <Link href="/login" className={styles.loginBtn}>
          Login to Dashboard
        </Link>
      </section>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} UniversalLighthouse. All rights reserved.
      </footer>
    </main>
  );
};

export default LandingPage;

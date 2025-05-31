'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
}

const navigationItems = [
  { id: 'causes', label: 'Causes', icon: '💡', description: 'Manage your causes' },
  { id: 'events', label: 'Events', icon: '📅', description: 'Upcoming events' },
  { id: 'gallery', label: 'Gallery', icon: '🖼️', description: 'Photo gallery' },
  { id: 'teams', label: 'Teams', icon: '👥', description: 'Team members' },
];

export default function Sidebar({ activeComponent, setActiveComponent }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and handle resize
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const sidebar = document.querySelector(`.${styles.sidebar}`);
        const menuButton = document.querySelector(`.${styles.menuButton}`);
        
        if (sidebar && menuButton && 
            !sidebar.contains(event.target as Node) && 
            !menuButton.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);
  const handleNavigationClick = (componentId: string) => {
    setActiveComponent(componentId);
    if (isMobile) {
      setIsOpen(false); // Close sidebar after navigation on mobile
    }
  };

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err: unknown) {
      console.error('Failed to logout:', err);
      // Could add error state here if needed
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button 
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <div className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isMobile ? (isOpen ? styles.open : styles.closed) : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🏮</span>
            </div>
            <div className={styles.brandInfo}>
              <h2 className={styles.brandName}>Universal Lighthouse</h2>
              <p className={styles.brandTagline}>Illuminating Change</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          {isMobile && (
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation menu"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
        
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {navigationItems.map((item) => (
              <li key={item.id} className={styles.navItem}>
                <button 
                  className={`${styles.navButton} ${activeComponent === item.id ? styles.active : ''}`}
                  onClick={() => handleNavigationClick(item.id)}
                  type="button"
                >
                  <div className={styles.navContent}>
                    <span className={styles.navIcon}>{item.icon}</span>
                    <div className={styles.navText}>
                      <span className={styles.navLabel}>{item.label}</span>
                      <span className={styles.navDescription}>{item.description}</span>
                    </div>
                  </div>
                  <div className={styles.navIndicator}></div>
                </button>
              </li>
            ))}
          </ul>        </nav>
        
        <div className={styles.sidebarFooter}>
          <div className={styles.footerContent}>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              type="button"
              title="Sign out of your account"
            >
              <span className={styles.logoutIcon}>🚪</span>
              <span className={styles.logoutText}>Logout</span>
            </button>
            
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot}></span>
              <span className={styles.statusText}>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
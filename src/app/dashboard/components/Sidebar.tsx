'use client';

import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeComponent: string;
  setActiveComponent: (component: string) => void;
}

export default function Sidebar({ activeComponent, setActiveComponent }: SidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Universal Lighthouse</h2>
      </div>
      <ul className={styles.sidebarMenu}>
        <li className={activeComponent === 'causes' ? styles.active : styles.nav}>
          <a href="#" onClick={() => setActiveComponent('causes')}>
            <i className="icon-causes"></i> Causes
          </a>
        </li>
        <li className={activeComponent === 'events' ? styles.active : styles.nav}>
          <a href="#" onClick={() => setActiveComponent('events')}>
            <i className="icon-events"></i> Events
          </a>
        </li>
        <li className={activeComponent === 'gallery' ? styles.active : styles.nav}>
          <a href="#" onClick={() => setActiveComponent('gallery')}>
            <i className="icon-gallery"></i> Gallery
          </a>
        </li>
        <li className={activeComponent === 'teams' ? styles.active : styles.nav}>
          <a href="#" onClick={() => setActiveComponent('teams')}>
            <i className="icon-teams"></i> Teams
          </a>
        </li>
      </ul>
    </div>
  );
} 
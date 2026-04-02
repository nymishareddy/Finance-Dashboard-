import React from 'react';
import styles from './MobileNav.module.css';

const NAV_ITEMS = [
  { page: 'dashboard',    icon: '◈', label: 'Home' },
  { page: 'transactions', icon: '⟳', label: 'Txns' },
  { page: 'insights',     icon: '◉', label: 'Insights' },
];

export default function MobileNav({ activePage, onNavigate }) {
  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map(item => (
        <button
          key={item.page}
          className={`${styles.item} ${activePage === item.page ? styles.active : ''}`}
          onClick={() => onNavigate(item.page)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

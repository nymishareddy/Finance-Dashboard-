import React from 'react';
import { useApp } from '../context/AppContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { page: 'dashboard',    icon: '◈', label: 'Dashboard' },
  { page: 'transactions', icon: '⟳', label: 'Transactions' },
  { page: 'insights',     icon: '◉', label: 'Insights' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { state, dispatch } = useApp();

  function changeRole(e) {
    dispatch({ type: 'SET_ROLE', payload: e.target.value });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          Nym<span>.</span>track
        </div>
        <div className={styles.logoSub}>financial dashboard</div>
      </div>

      <div className={styles.navSection}>Overview</div>
      {NAV_ITEMS.map(item => (
        <button
          key={item.page}
          className={`${styles.navItem} ${activePage === item.page ? styles.active : ''}`}
          onClick={() => onNavigate(item.page)}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className={styles.footer}>
        <div className={styles.roleSelector}>
          <div className={styles.roleLabel}>Current Role</div>
          <select
            className={styles.roleSelect}
            value={state.role}
            onChange={changeRole}
          >
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <div className={`${styles.roleBadge} ${styles[state.role]}`}>
            {state.role === 'admin' ? '▲ full access' : '● read only'}
          </div>
        </div>
      </div>
    </aside>
  );
}

import React from 'react';
import { useApp } from '../context/AppContext';
import { exportToCSV } from '../utils';
import { filterTransactions } from '../utils';
import styles from './Topbar.module.css';

export default function Topbar({ title, onAddTransaction }) {
  const { state } = useApp();
  const isAdmin = state.role === 'admin';

  function handleExport() {
    const tx = filterTransactions(state.transactions, state.filters, state.sort);
    exportToCSV(tx);
  }

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.actions}>
        <button className={styles.btnGhost} onClick={handleExport}>
          ↓ Export CSV
        </button>
        {isAdmin && (
          <button className={styles.btnPrimary} onClick={onAddTransaction}>
            + Add Transaction
          </button>
        )}
      </div>
    </header>
  );
}

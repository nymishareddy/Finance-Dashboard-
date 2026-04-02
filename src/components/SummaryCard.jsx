import React from 'react';
import styles from './SummaryCard.module.css';

export default function SummaryCard({ label, amount, change, changeDir, variant }) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.amount}>{amount}</div>
      {change && (
        <div className={`${styles.change} ${styles[changeDir]}`}>
          {changeDir === 'up' ? '▲' : '▼'} {change}
          <span>vs last month</span>
        </div>
      )}
    </div>
  );
}

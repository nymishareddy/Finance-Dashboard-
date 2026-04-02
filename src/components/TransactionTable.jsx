import React from 'react';
import { useApp } from '../context/AppContext';
import { fmtDate, fmtFull } from '../utils';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../data/transactions';
import styles from './TransactionTable.module.css';

export default function TransactionTable({ transactions, showSort = false, limit }) {
  const { state, dispatch } = useApp();
  const isAdmin = state.role === 'admin';
  const rows = limit ? transactions.slice(0, limit) : transactions;

  function handleSort(field) {
    if (showSort) dispatch({ type: 'SET_SORT', field });
  }

  function handleDelete(id) {
    if (window.confirm('Delete this transaction?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  }

  function sortIcon(field) {
    if (state.sort.field !== field) return <span className={styles.sortNeutral}>⇅</span>;
    return state.sort.direction === 'desc'
      ? <span className={styles.sortActive}>↓</span>
      : <span className={styles.sortActive}>↑</span>;
  }

  if (rows.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <div className={styles.emptyTitle}>No transactions found</div>
        <div className={styles.emptyDesc}>Try adjusting your filters or add a new transaction.</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={showSort ? styles.sortable : ''}
              onClick={() => handleSort('merchant')}
            >
              Merchant {showSort && sortIcon('merchant')}
            </th>
            <th
              className={showSort ? styles.sortable : ''}
              onClick={() => handleSort('date')}
            >
              Date {showSort && sortIcon('date')}
            </th>
            <th>Category</th>
            <th
              className={`${styles.right} ${showSort ? styles.sortable : ''}`}
              onClick={() => handleSort('amount')}
            >
              Amount {showSort && sortIcon('amount')}
            </th>
            {isAdmin && showSort && <th className={styles.right}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(tx => (
            <tr key={tx.id}>
              <td>
                <div className={styles.merchant}>
                  <div
                    className={styles.icon}
                    style={{ background: (CATEGORY_COLORS[tx.category] || '#888') + '20' }}
                  >
                    {CATEGORY_ICONS[tx.category] || '💳'}
                  </div>
                  <div>
                    <div className={styles.name}>{tx.merchant}</div>
                    {tx.note && <div className={styles.note}>{tx.note}</div>}
                  </div>
                </div>
              </td>
              <td>
                <span className={styles.date}>{fmtDate(tx.date)}</span>
              </td>
              <td>
                <span
                  className={styles.badge}
                  style={{
                    background: (CATEGORY_COLORS[tx.category] || '#888') + '18',
                    color: CATEGORY_COLORS[tx.category] || '#888',
                  }}
                >
                  {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
                </span>
              </td>
              <td className={styles.right}>
                <span className={`${styles.amount} ${styles[tx.type]}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmtFull(tx.amount)}
                </span>
              </td>
              {isAdmin && showSort && (
                <td className={styles.right}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(tx.id)}
                    title="Delete transaction"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

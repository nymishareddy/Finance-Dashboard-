import React from 'react';
import { useApp } from '../context/AppContext';
import TransactionTable from '../components/TransactionTable';
import { filterTransactions } from '../utils';
import { CATEGORIES } from '../data/transactions';
import styles from './Transactions.module.css';

export default function Transactions() {
  const { state, dispatch } = useApp();
  const { filters, sort, transactions } = state;

  const filtered = filterTransactions(transactions, filters, sort);

  function setFilter(key, value) {
    dispatch({ type: 'SET_FILTER', key, value });
  }

  function resetFilters() {
    dispatch({ type: 'RESET_FILTERS' });
  }

  const hasActiveFilters =
    filters.search || filters.type !== 'all' || filters.category !== 'all';

  return (
    <div className={styles.page}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search merchant, category, note…"
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={filters.type}
          onChange={e => setFilter('type', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          className={styles.filterSelect}
          value={filters.category}
          onChange={e => setFilter('category', e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className={styles.resetBtn} onClick={resetFilters}>
            ✕ Clear
          </button>
        )}

        <span className={styles.resultCount}>{filtered.length} results</span>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {[
          {
            label: 'Showing',
            value: filtered.length,
            unit: 'transactions',
          },
          {
            label: 'Total Income',
            value: '₹' + filtered
              .filter(t => t.type === 'income')
              .reduce((s, t) => s + t.amount, 0)
              .toLocaleString('en-IN'),
          },
          {
            label: 'Total Expenses',
            value: '₹' + filtered
              .filter(t => t.type === 'expense')
              .reduce((s, t) => s + t.amount, 0)
              .toLocaleString('en-IN'),
          },
        ].map(s => (
          <div key={s.label} className={styles.statChip}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            {s.unit && <span className={styles.statUnit}>{s.unit}</span>}
          </div>
        ))}
      </div>

      <TransactionTable transactions={filtered} showSort={true} />
    </div>
  );
}

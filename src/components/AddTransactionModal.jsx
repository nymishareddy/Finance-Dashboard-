import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/transactions';
import styles from './Modal.module.css';

export default function AddTransactionModal({ onClose, onSuccess }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    merchant: '',
    amount: '',
    type: 'expense',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.merchant.trim()) { setError('Merchant name is required.'); return; }
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: Date.now(),
        merchant: form.merchant.trim(),
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        note: form.note.trim(),
      },
    });
    onSuccess('Transaction added successfully!');
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Transaction</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Merchant</label>
              <input
                className={styles.input}
                name="merchant"
                value={form.merchant}
                onChange={handleChange}
                placeholder="e.g. Swiggy"
                autoFocus
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Amount (₹)</label>
              <input
                className={styles.input}
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Type</label>
              <select className={styles.input} name="type" value={form.type} onChange={handleChange}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Category</label>
              <select className={styles.input} name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Date</label>
            <input
              className={styles.input}
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Note (optional)</label>
            <input
              className={styles.input}
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Brief description…"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.btnPrimary}>Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
}

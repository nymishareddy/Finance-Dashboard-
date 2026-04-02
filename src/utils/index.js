// Currency formatting
export function fmt(n) {
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'k';
  return '₹' + n.toLocaleString('en-IN');
}

export function fmtFull(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// Date formatting
export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function fmtMonthYear(d) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

// Summary computations
export function computeSummary(transactions) {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;
  const savings = income > 0 ? Math.round((balance / income) * 100) : 0;
  return { income, expense, balance, savings };
}

// Category breakdown (expenses only)
export function getCategoryBreakdown(transactions) {
  const map = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

// Monthly data for charts
export function getMonthlyData(transactions, months = 6) {
  const result = {};
  const now = new Date('2026-04-01');
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    result[key] = { income: 0, expense: 0 };
  }
  transactions.forEach(t => {
    const key = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    if (result[key]) result[key][t.type] += t.amount;
  });
  return result;
}

// Filter + sort transactions
export function filterTransactions(transactions, filters, sort) {
  let tx = [...transactions];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    tx = tx.filter(
      t =>
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q),
    );
  }

  if (filters.type !== 'all') tx = tx.filter(t => t.type === filters.type);
  if (filters.category !== 'all') tx = tx.filter(t => t.category === filters.category);

  tx.sort((a, b) => {
    let va = a[sort.field];
    let vb = b[sort.field];
    if (sort.field === 'amount') { va = +va; vb = +vb; }
    if (sort.field === 'date')   { va = new Date(va); vb = new Date(vb); }
    const cmp = va > vb ? 1 : va < vb ? -1 : 0;
    return sort.direction === 'desc' ? -cmp : cmp;
  });

  return tx;
}

// CSV export
export function exportToCSV(transactions, filename = 'transactions.csv') {
  const headers = ['Date', 'Merchant', 'Type', 'Category', 'Amount', 'Note'];
  const rows = transactions.map(t => [
    t.date, t.merchant, t.type, t.category, t.amount, t.note || '',
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

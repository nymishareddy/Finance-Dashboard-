import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import { computeSummary, getCategoryBreakdown, getMonthlyData, fmt } from '../utils';
import { CATEGORY_COLORS } from '../data/transactions';
import styles from './Dashboard.module.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
);

const PERIODS = ['3M', '6M', '12M'];
const PERIOD_MONTHS = { '3M': 3, '6M': 6, '12M': 12 };

export default function Dashboard() {
  const { state } = useApp();
  const [period, setPeriod] = useState('6M');

  const { transactions } = state;
  const summary = computeSummary(transactions);
  const catBreakdown = getCategoryBreakdown(transactions);
  const monthlyData = getMonthlyData(transactions, PERIOD_MONTHS[period]);

  const labels = Object.keys(monthlyData);
  const incomeData  = labels.map(l => monthlyData[l].income);
  const expenseData = labels.map(l => monthlyData[l].expense);

  const donutCats   = catBreakdown.slice(0, 6);
  const donutColors = donutCats.map(([cat]) => CATEGORY_COLORS[cat] || '#888');
  const expenseTotal = catBreakdown.reduce((s, c) => s + c[1], 0);

  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        borderColor: '#4d9eff',
        backgroundColor: 'rgba(77,158,255,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4d9eff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Expenses',
        data: expenseData,
        borderColor: '#ff5c7a',
        backgroundColor: 'rgba(255,92,122,0.06)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ff5c7a',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1a1d28',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#9899a8',
        bodyColor: '#f0f0f5',
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5f6070', font: { size: 11, family: 'DM Mono' } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#5f6070',
          font: { size: 11, family: 'DM Mono' },
          callback: v => fmt(v),
        },
      },
    },
  };

  const donutData = {
    labels: donutCats.map(([cat]) => cat),
    datasets: [{
      data: donutCats.map(([, amt]) => amt),
      backgroundColor: donutColors,
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => `₹${ctx.raw.toLocaleString('en-IN')}` },
      },
    },
  };

  return (
    <div className={styles.page}>
      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <SummaryCard
          label="Total Balance"
          amount={fmt(summary.balance)}
          change="12.4%"
          changeDir="up"
          variant="balance"
        />
        <SummaryCard
          label="Total Income"
          amount={fmt(summary.income)}
          change="8.2%"
          changeDir="up"
          variant="income"
        />
        <SummaryCard
          label="Total Expenses"
          amount={fmt(summary.expense)}
          change="3.1%"
          changeDir="down"
          variant="expense"
        />
        <SummaryCard
          label="Savings Rate"
          amount={`${summary.savings}%`}
          change="5.6%"
          changeDir="up"
          variant="savings"
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        {/* Line Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Cash Flow</div>
              <div className={styles.panelSub}>Income vs Expenses over time</div>
            </div>
            <div className={styles.periodTabs}>
              {PERIODS.map(p => (
                <button
                  key={p}
                  className={`${styles.periodTab} ${period === p ? styles.active : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#4d9eff' }} />
              Income
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#ff5c7a' }} />
              Expenses
            </span>
          </div>
          <div className={styles.chartWrap}>
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

        {/* Donut Chart */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Spending by Category</div>
              <div className={styles.panelSub}>All-time breakdown</div>
            </div>
          </div>
          <div className={styles.donutWrap}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
          <div className={styles.donutLegend}>
            {donutCats.map(([cat, amt]) => (
              <div key={cat} className={styles.donutLegendItem}>
                <span
                  className={styles.donutDot}
                  style={{ background: CATEGORY_COLORS[cat] || '#888' }}
                />
                <span className={styles.donutName}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
                <span className={styles.donutPct}>
                  {Math.round((amt / expenseTotal) * 100)}%
                </span>
                <span className={styles.donutAmt}>{fmt(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.sectionTitle}>Recent Transactions</div>
      <TransactionTable transactions={recentTx} showSort={false} />
    </div>
  );
}

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import {
  computeSummary, getCategoryBreakdown,
  getMonthlyData, fmt, fmtFull,
} from '../utils';
import { CATEGORY_COLORS } from '../data/transactions';
import styles from './Insights.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SAVINGS_TARGET = 600000;

export default function Insights() {
  const { state } = useApp();
  const { transactions } = state;

  const [aiInsights, setAiInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetPlan, setBudgetPlan] = useState('');
  const [loadingBudget, setLoadingBudget] = useState(false);

  // Read the API key from the .env file
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  async function handleGetInsights() {
    setLoadingInsights(true);
    setAiInsights('');
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const expenseData = expenses.map(e => `${e.category}: ₹${e.amount}`).join(", ");
    
    const prompt = `Here is my current expense data: ${expenseData}. 
    Please provide:
    1. A short spending summary
    2. Any unnecessary expenses
    3. Saving tips
    Keep it concise.`;

    try {
      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setAiInsights(data.candidates[0].content.parts[0].text);
    } catch (err) {
      console.error(err);
      setAiInsights("Failed to load insights. Please check your API key.");
    } finally {
      setLoadingInsights(false);
    }
  }

  async function handleGenerateBudget() {
    if (!budgetInput) return;
    setLoadingBudget(true);
    setBudgetPlan('');
    
    const prompt = `I have a monthly budget of ₹${budgetInput}. 
    Please suggest a realistic category-wise budget split. 
    Format the output strictly as a simple list like:
    Food: ₹...
    Travel: ₹...
    Savings: ₹...`;

    try {
      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setBudgetPlan(data.candidates[0].content.parts[0].text);
    } catch (err) {
      console.error(err);
      setBudgetPlan("Failed to generate plan. Please check your API key.");
    } finally {
      setLoadingBudget(false);
    }
  }

 
  const summary      = computeSummary(transactions);
  const catBreakdown = getCategoryBreakdown(transactions);
  const topCat       = catBreakdown[0];
  const expenseTotal = catBreakdown.reduce((s, c) => s + c[1], 0);

  const monthly6 = getMonthlyData(transactions, 6);
  const months6  = Object.keys(monthly6);
  const thisMonth = monthly6[months6[months6.length - 1]] || { income: 0, expense: 0 };
  const lastMonth = monthly6[months6[months6.length - 2]] || { income: 0, expense: 0 };
  const expenseDiff = thisMonth.expense - lastMonth.expense;
  const isHigher    = expenseDiff > 0;

  const savingsPct = Math.min(100, Math.round((summary.balance / SAVINGS_TARGET) * 100));

  // Bar chart: monthly comparison
  const barData = {
    labels: months6,
    datasets: [
      {
        label: 'Income',
        data: months6.map(l => monthly6[l].income),
        backgroundColor: 'rgba(77,158,255,0.65)',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: months6.map(l => monthly6[l].expense),
        backgroundColor: 'rgba(255,92,122,0.65)',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d28',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
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

  // Horizontal bar chart for category breakdown
  const hBarData = {
    labels: catBreakdown.map(([cat]) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      data: catBreakdown.map(([, amt]) => amt),
      backgroundColor: catBreakdown.map(([cat]) => CATEGORY_COLORS[cat] || '#888'),
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  const hBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: ctx => `₹${ctx.raw.toLocaleString('en-IN')}` },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#5f6070',
          font: { size: 11, family: 'DM Mono' },
          callback: v => fmt(v),
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#9899a8', font: { size: 12, family: 'Outfit' } },
      },
    },
  };

  const hBarHeight = catBreakdown.length * 42 + 60;

  const observations = [
    {
      icon: '💡',
      title: 'Highest income month',
      desc: `${months6[months6.length - 1]} with ${fmt(Math.max(...months6.map(l => monthly6[l].income)))} total income`,
    },
    {
      icon: '⚠️',
      title: 'Biggest expense category',
      desc: topCat
        ? `${topCat[0]} accounts for ${Math.round((topCat[1] / expenseTotal) * 100)}% of all spending`
        : 'No expense data yet',
    },
    {
      icon: '📈',
      title: 'Income-to-expense ratio',
      desc: summary.expense > 0
        ? `${(summary.income / summary.expense).toFixed(2)}x — for every ₹1 spent, you earn ₹${(summary.income / summary.expense).toFixed(2)}`
        : 'No expense data yet',
    },
    {
      icon: '🎯',
      title: 'Savings rate',
      desc: `${summary.savings}% — ${summary.savings >= 30 ? 'above' : 'below'} the recommended 30% threshold`,
    },
  ];

  return (
    <div className={styles.page}>

      {/* Insight Cards */}
      <div className={styles.insightGrid}>

        <div className={styles.insightCard}>
          <div className={`${styles.insightTag} ${styles.warning}`}>⚑ Top Spending</div>
          <div className={styles.insightValue}>
            {topCat ? topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1) : '—'}
          </div>
          <div className={styles.insightDesc}>
            You spent <strong>{topCat ? fmtFull(topCat[1]) : '₹0'}</strong> on{' '}
            {topCat ? topCat[0] : '—'}, which is{' '}
            {topCat ? Math.round((topCat[1] / expenseTotal) * 100) : 0}% of your total expenses.
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: topCat ? `${Math.round((topCat[1] / expenseTotal) * 100)}%` : '0%',
                background: 'var(--amber)',
              }}
            />
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={`${styles.insightTag} ${isHigher ? styles.warning : styles.success}`}>
            {isHigher ? '▲ Higher' : '▼ Lower'} This Month
          </div>
          <div className={styles.insightValue}>
            {isHigher ? '+' : '-'}{fmt(Math.abs(expenseDiff))}
          </div>
          <div className={styles.insightDesc}>
            Your spending compared to last month.{' '}
            {isHigher
              ? 'Consider reviewing discretionary spending.'
              : 'Great job cutting back!'}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: lastMonth.expense > 0
                  ? `${Math.min(100, Math.round((thisMonth.expense / lastMonth.expense) * 100))}%`
                  : '0%',
                background: isHigher ? 'var(--red)' : 'var(--green)',
              }}
            />
          </div>
        </div>

        <div className={styles.insightCard}>
          <div className={`${styles.insightTag} ${styles.info}`}>◎ Savings Goal</div>
          <div className={styles.insightValue}>{savingsPct}%</div>
          <div className={styles.insightDesc}>
            You've saved <strong>{fmt(summary.balance)}</strong> toward your ₹6L annual goal.{' '}
            {summary.balance < SAVINGS_TARGET
              ? `${fmt(SAVINGS_TARGET - summary.balance)} to go!`
              : 'Goal achieved! 🎉'}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${savingsPct}%`, background: 'var(--green)' }}
            />
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Monthly Comparison</div>
              <div className={styles.panelSub}>Income vs expenses — last 6 months</div>
            </div>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'rgba(77,158,255,0.65)' }} />
                Income
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'rgba(255,92,122,0.65)' }} />
                Expenses
              </span>
            </div>
          </div>
          <div style={{ position: 'relative', height: '240px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Category Breakdown</div>
              <div className={styles.panelSub}>Expense distribution</div>
            </div>
          </div>
          <div style={{ position: 'relative', height: `${hBarHeight}px` }}>
            <Bar data={hBarData} options={hBarOptions} />
          </div>
        </div>
      </div>

      {/* Key Observations */}
      <div className={styles.panel} style={{ marginTop: '14px' }}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Key Observations</div>
        </div>
        <div className={styles.observationsGrid}>
          {observations.map(o => (
            <div key={o.title} className={styles.observation}>
              <span className={styles.obsIcon}>{o.icon}</span>
              <div>
                <div className={styles.obsTitle}>{o.title}</div>
                <div className={styles.obsDesc}>{o.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className={styles.chartsGrid} style={{ marginTop: '14px' }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>🤖 AI Expense Insights</div>
              <div className={styles.panelSub}>Analyze your current spending habits</div>
            </div>
            <button className={styles.aiBtn} onClick={handleGetInsights} disabled={loadingInsights}>
              {loadingInsights ? 'Loading...' : 'Get AI Insights'}
            </button>
          </div>
          <div className={styles.aiOutput}>
            {aiInsights || "Waiting for your request..."}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>💰 AI Budget Planner</div>
              <div className={styles.panelSub}>Get a suggested budget split</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                className={styles.aiInput} 
                placeholder="Enter budget (₹)" 
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
              />
              <button className={styles.aiBtn} onClick={handleGenerateBudget} disabled={loadingBudget}>
                {loadingBudget ? 'Loading...' : 'Generate Plan'}
              </button>
            </div>
          </div>
          <div className={styles.aiOutput}>
            {budgetPlan || "Waiting for your request..."}
          </div>
        </div>
      </div>
    </div>
  );
}

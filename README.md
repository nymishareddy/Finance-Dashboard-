# Nym.track — Finance Dashboard

A clean, interactive personal finance dashboard built with React. Track your income, expenses, and spending patterns with a polished dark-mode UI.

---

## Preview

> Dark-themed dashboard with sidebar navigation, summary cards, line/donut charts, a sortable transaction table, and an insights page.

---

## Features

### Dashboard
- **Summary cards** — Total Balance, Total Income, Total Expenses, Savings Rate with period-over-period change indicators
- **Cash Flow chart** — Line chart showing income vs expenses over the last 3, 6, or 12 months (switchable via tabs)
- **Category donut chart** — Visual breakdown of spending by category with legend
- **Recent transactions** — Last 7 transactions at a glance

### Transactions
- Full sortable table with columns for Merchant, Date, Category, Amount
- **Live search** — filter by merchant name, category, or note
- **Type filter** — All / Income / Expense
- **Category filter** — per-category drill-down
- **Sort** — click any column header to sort ascending/descending
- **Delete** — Admin can remove transactions (with confirmation)
- Running totals shown for the current filtered view

### Insights
- **Top spending category** with share of total expenses
- **Month-over-month comparison** — whether you spent more or less vs last month
- **Savings goal tracker** — progress toward a ₹6L annual goal
- **Monthly grouped bar chart** — 6-month income vs expense comparison
- **Horizontal category bar chart** — ranked expense categories
- **Key observations panel** — 4 auto-generated insights from the data

### Role-Based UI
Switch between **Admin** and **Viewer** using the role selector in the sidebar:

| Feature               | Admin | Viewer |
|-----------------------|-------|--------|
| View all data         | ✅    | ✅    |
| Add transactions      | ✅    | ❌    |
| Delete transactions   | ✅    | ❌    |
| Export CSV            | ✅    | ✅    |

### Other
- **Data persistence** — transactions and role saved to `localStorage`
- **CSV export** — exports the currently filtered view
- **Fully responsive** — desktop sidebar + mobile bottom nav
- **Animated modal** for adding transactions with validation
- **Toast notifications** for all user actions
- 44 pre-loaded mock transactions (Nov 2025 – Mar 2026, ₹ INR)

---

## Tech Stack

| Layer          | Choice                          |
|----------------|---------------------------------|
| Framework      | React 18                        |
| State          | `useReducer` + Context API      |
| Charts         | Chart.js + react-chartjs-2      |
| Styling        | CSS Modules                     |
| Persistence    | localStorage                    |
| Fonts          | DM Serif Display, Outfit, DM Mono (Google Fonts) |

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# 1. Clone or unzip the project

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
```

Output goes to the `build/` folder — ready to deploy to Netlify, Vercel, GitHub Pages, etc.

---

## Project Structure

```
Nym.track-dashboard/
├── public/
│   └── index.html
└── src/
    ├── context/
    │   └── AppContext.jsx        # Global state (useReducer + Context)
    ├── data/
    │   └── transactions.js       # Mock data + category constants
    ├── hooks/
    │   └── useToast.js           # Toast notification hook
    ├── utils/
    │   └── index.js              # Formatting, filtering, CSV export helpers
    ├── components/
    │   ├── Sidebar.jsx           # Navigation sidebar
    │   ├── Topbar.jsx            # Page header with actions
    │   ├── SummaryCard.jsx       # Metric card (balance, income, etc.)
    │   ├── TransactionTable.jsx  # Reusable sortable table
    │   ├── AddTransactionModal.jsx
    │   ├── MobileNav.jsx         # Bottom nav for mobile
    │   └── Toast.jsx             # Toast notification
    ├── pages/
    │   ├── Dashboard.jsx         # Main overview page
    │   ├── Transactions.jsx      # Full transaction list with filters
    │   └── Insights.jsx          # Analytics and observations
    ├── App.jsx                   # Root component + router
    ├── App.module.css
    └── index.css                 # Global tokens + reset
```

---

## State Management Approach

All application state lives in a single `useReducer` inside `AppContext`:

```js
{
  transactions: [...],   // full list (loaded from localStorage or mock data)
  role: 'admin',         // 'admin' | 'viewer'
  filters: {
    search: '',
    type: 'all',
    category: 'all',
  },
  sort: {
    field: 'date',
    direction: 'desc',
  },
}
```

Actions: `SET_TRANSACTIONS`, `ADD_TRANSACTION`, `DELETE_TRANSACTION`, `SET_ROLE`, `SET_FILTER`, `RESET_FILTERS`, `SET_SORT`.

Mutations to `transactions` and `role` are automatically persisted to `localStorage`.

---

## Design Decisions

- **Dark-only theme** — financial dashboards are often used for long sessions; dark reduces eye strain.
- **DM Serif Display** as display font — adds character without sacrificing legibility.
- **DM Mono** for all numbers — monospaced digits prevent layout jumps as values change.
- **CSS Modules** over Tailwind — keeps styles co-located with components and avoids class name collisions.
- **No external router** — three pages is manageable with simple state; avoids over-engineering.

---

## Assumptions

- Currency is Indian Rupee (₹); amounts are whole numbers.
- "Savings goal" is a fixed demo target of ₹6,00,000.
- Period-over-period percentage changes on the summary cards are static demo values (would be computed from real data in production).
- Role switching is frontend-only for demonstration; no auth backend is included.

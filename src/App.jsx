import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MobileNav from './components/MobileNav';
import AddTransactionModal from './components/AddTransactionModal';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import { useToast } from './hooks/useToast';
import styles from './App.module.css';

const PAGE_TITLES = {
  dashboard:    'Dashboard',
  transactions: 'Transactions',
  insights:     'Insights',
};

function AppInner() {
  const [page, setPage] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const { toast, showToast } = useToast();

  function renderPage() {
    if (page === 'dashboard')    return <Dashboard />;
    if (page === 'transactions') return <Transactions />;
    if (page === 'insights')     return <Insights />;
    return null;
  }

  return (
    <div className={styles.app}>
      <Sidebar activePage={page} onNavigate={setPage} />

      <div className={styles.mainWrap}>
        <Topbar
          title={PAGE_TITLES[page]}
          onAddTransaction={() => setShowModal(true)}
        />
        <main className={styles.main}>
          {renderPage()}
        </main>
      </div>

      <MobileNav activePage={page} onNavigate={setPage} />

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={showToast}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

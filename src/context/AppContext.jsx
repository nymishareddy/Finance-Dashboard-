import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { INITIAL_TRANSACTIONS } from '../data/transactions';

const AppContext = createContext(null);

const initialState = {
  transactions: [],
  role: 'admin',
  filters: {
    search: '',
    type: 'all',
    category: 'all',
  },
  sort: {
    field: 'date',
    direction: 'desc',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };

    case 'ADD_TRANSACTION': {
      const next = [action.payload, ...state.transactions];
      localStorage.setItem('flow_transactions', JSON.stringify(next));
      return { ...state, transactions: next };
    }

    case 'DELETE_TRANSACTION': {
      const next = state.transactions.filter(t => t.id !== action.payload);
      localStorage.setItem('flow_transactions', JSON.stringify(next));
      return { ...state, transactions: next };
    }

    case 'SET_ROLE':
      localStorage.setItem('flow_role', action.payload);
      return { ...state, role: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { search: '', type: 'all', category: 'all' },
      };

    case 'SET_SORT':
      return {
        ...state,
        sort: {
          field: action.field,
          direction:
            state.sort.field === action.field && state.sort.direction === 'desc'
              ? 'asc'
              : 'desc',
        },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('flow_transactions');
    const storedRole = localStorage.getItem('flow_role');
    dispatch({
      type: 'SET_TRANSACTIONS',
      payload: stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS,
    });
    if (storedRole) dispatch({ type: 'SET_ROLE', payload: storedRole });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

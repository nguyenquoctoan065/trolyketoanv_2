import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState, InvoiceData } from './types';

type Action =
  | { type: 'ADD_INVOICE'; payload: InvoiceData }
  | { type: 'UPDATE_INVOICE'; payload: InvoiceData }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'CLEAR_DEMO_INVOICES' }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  invoices: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.id ? action.payload : inv
        ),
      };
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter((inv) => inv.id !== action.payload),
      };
    case 'CLEAR_DEMO_INVOICES':
      return {
        ...state,
        invoices: state.invoices.filter((inv) => {
           if (inv.is_demo) return false;
           const vendorName = String(inv.vendor_name?.value || '').toLowerCase();
           if (vendorName.includes('điện lực') || vendorName.includes('vật tư office')) return false;
           return true;
        }),
      };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  actions: {
    addInvoice: (inv: InvoiceData) => void;
    updateInvoice: (inv: InvoiceData) => void;
    deleteInvoice: (id: string) => void;
    clearDemoInvoices: () => void;
  };
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('invoice_app_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    if (state !== initialState) {
      localStorage.setItem('invoice_app_data', JSON.stringify(state));
    }
  }, [state]);

  const actions = {
     addInvoice: (inv: InvoiceData) => dispatch({ type: 'ADD_INVOICE', payload: inv }),
     updateInvoice: (inv: InvoiceData) => dispatch({ type: 'UPDATE_INVOICE', payload: inv }),
     deleteInvoice: (id: string) => dispatch({ type: 'DELETE_INVOICE', payload: id }),
     clearDemoInvoices: () => dispatch({ type: 'CLEAR_DEMO_INVOICES' }),
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
}

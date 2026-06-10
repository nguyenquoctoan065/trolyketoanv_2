"use client";

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState, InvoiceData } from './types';
import { supabase } from './lib/supabaseClient';
import { toast } from './components/Toast';

type Action =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_INVOICES'; payload: InvoiceData[] }
  | { type: 'ADD_INVOICE'; payload: InvoiceData }
  | { type: 'UPDATE_INVOICE'; payload: InvoiceData }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'DELETE_ALL_INVOICES' }
  | { type: 'CLEAR_DEMO_INVOICES' }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  invoices: [],
  user: null,
  authLoading: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, authLoading: false };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_INVOICES':
      return { ...state, invoices: action.payload };
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
    case 'DELETE_ALL_INVOICES':
      return {
        ...state,
        invoices: [],
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
    case 'LOGOUT':
      return { ...state, user: null, invoices: [], authLoading: false };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  actions: {
    addInvoice: (inv: InvoiceData) => Promise<void>;
    updateInvoice: (inv: InvoiceData) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    deleteAllInvoices: () => Promise<void>;
    clearDemoInvoices: () => Promise<void>;
    signOut: () => Promise<void>;
  };
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch invoices for the logged-in user
  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invoices: InvoiceData[] = (data || []).map((row: any) => ({
        id: row.id,
        original_file_url: row.original_file_url,
        original_file_name: row.original_file_name,
        created_at: new Date(row.created_at).getTime(),
        status: row.status,
        invoice_date: row.invoice_date,
        invoice_number: row.invoice_number,
        vendor_name: row.vendor_name,
        vendor_tax_code: row.vendor_tax_code,
        items: row.items || [],
        vat_rate: row.vat_rate,
        subtotal: row.subtotal,
        vat_amount: row.vat_amount,
        total: row.total,
        notes: row.notes,
        needs_review: row.needs_review,
        is_demo: row.is_demo,
      }));

      dispatch({ type: 'SET_INVOICES', payload: invoices });
    } catch (err: any) {
      console.error('Error fetching invoices from Supabase:', err);
      toast.error('Không thể tải dữ liệu hóa đơn: ' + err.message);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
      } else {
        dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch invoices whenever user changes
  useEffect(() => {
    if (state.user) {
      fetchInvoices();
    }
  }, [state.user]);

  const actions = {
    addInvoice: async (inv: InvoiceData) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Bạn cần đăng nhập để thực hiện tác vụ này.');
          return;
        }

        const { error } = await supabase.from('invoices').insert([
          {
            id: inv.id,
            user_id: user.id,
            original_file_url: inv.original_file_url,
            original_file_name: inv.original_file_name,
            status: inv.status,
            invoice_date: inv.invoice_date,
            invoice_number: inv.invoice_number,
            vendor_name: inv.vendor_name,
            vendor_tax_code: inv.vendor_tax_code,
            items: inv.items,
            vat_rate: inv.vat_rate,
            subtotal: inv.subtotal,
            vat_amount: inv.vat_amount,
            total: inv.total,
            notes: inv.notes,
            needs_review: inv.needs_review,
            is_demo: inv.is_demo || false,
          },
        ]);

        if (error) throw error;
        dispatch({ type: 'ADD_INVOICE', payload: inv });
      } catch (err: any) {
        console.error('Error inserting invoice in Supabase:', err);
        toast.error('Không thể lưu hóa đơn: ' + err.message);
      }
    },

    updateInvoice: async (inv: InvoiceData) => {
      try {
        const { error } = await supabase
          .from('invoices')
          .update({
            status: inv.status,
            invoice_date: inv.invoice_date,
            invoice_number: inv.invoice_number,
            vendor_name: inv.vendor_name,
            vendor_tax_code: inv.vendor_tax_code,
            items: inv.items,
            vat_rate: inv.vat_rate,
            subtotal: inv.subtotal,
            vat_amount: inv.vat_amount,
            total: inv.total,
            notes: inv.notes,
            needs_review: inv.needs_review,
          })
          .eq('id', inv.id);

        if (error) throw error;
        dispatch({ type: 'UPDATE_INVOICE', payload: inv });
      } catch (err: any) {
        console.error('Error updating invoice in Supabase:', err);
        toast.error('Không thể cập nhật hóa đơn: ' + err.message);
      }
    },

    deleteInvoice: async (id: string) => {
      try {
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', id);

        if (error) throw error;
        dispatch({ type: 'DELETE_INVOICE', payload: id });
      } catch (err: any) {
        console.error('Error deleting invoice from Supabase:', err);
        toast.error('Không thể xóa hóa đơn: ' + err.message);
      }
    },

    deleteAllInvoices: async () => {
      try {
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('user_id', state.user?.id);

        if (error) throw error;
        dispatch({ type: 'DELETE_ALL_INVOICES' });
        toast.success('Đã xóa tất cả dữ liệu hóa đơn.');
      } catch (err: any) {
        console.error('Error deleting all invoices from Supabase:', err);
        toast.error('Không thể xóa dữ liệu: ' + err.message);
      }
    },

    clearDemoInvoices: async () => {
      try {
        const demoInvoices = state.invoices.filter((inv) => {
          if (inv.is_demo) return true;
          const vendorName = String(inv.vendor_name?.value || '').toLowerCase();
          if (vendorName.includes('điện lực') || vendorName.includes('vật tư office')) return true;
          return false;
        });

        if (demoInvoices.length === 0) return;

        const demoIds = demoInvoices.map((inv) => inv.id);

        const { error } = await supabase
          .from('invoices')
          .delete()
          .in('id', demoIds);

        if (error) throw error;
        dispatch({ type: 'CLEAR_DEMO_INVOICES' });
      } catch (err: any) {
        console.error('Error clearing demo invoices in Supabase:', err);
        toast.error('Không thể xóa dữ liệu mẫu: ' + err.message);
      }
    },

    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        dispatch({ type: 'LOGOUT' });
        toast.success('Đã đăng xuất tài khoản.');
      } catch (err: any) {
        console.error('SignOut error:', err);
        toast.error('Lỗi khi đăng xuất: ' + err.message);
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
};

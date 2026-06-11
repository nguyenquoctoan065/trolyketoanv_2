import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

let toastCount = 0;
let listeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export const toast = {
  success: (message: string) => addToast('success', message),
  error: (message: string) => addToast('error', message),
  info: (message: string) => addToast('info', message),
  warning: (message: string) => addToast('warning', message),
};

function addToast(type: ToastType, message: string) {
  const id = `toast-${toastCount++}`;
  toasts = [...toasts, { id, type, message }];
  emit();
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => {
      setCurrentToasts(newToasts);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border bg-white animate-in slide-in-from-right-4 ${
            t.type === 'success' ? 'border-primary-500' : t.type === 'error' ? 'border-red-500' : t.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
          }`}
        >
          {t.type === 'success' && <CheckCircle className="text-primary-500 w-5 h-5" />}
          {t.type === 'error' && <XCircle className="text-red-500 w-5 h-5" />}
          {t.type === 'warning' && <AlertTriangle className="text-yellow-500 w-5 h-5" />}
          {t.type === 'info' && <AlertCircle className="text-blue-500 w-5 h-5" />}
          <p className="text-sm font-medium text-gray-800">{t.message}</p>
          <button onClick={() => removeToast(t.id)} className="ml-4 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

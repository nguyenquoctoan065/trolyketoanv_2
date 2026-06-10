"use client";

import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { getAllOfflineInvoices, OfflineInvoice, deleteOfflineInvoice } from '../lib/offlineDb';

export default function OfflineQueue() {
  const [pendingInvoices, setPendingInvoices] = useState<OfflineInvoice[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadInvoices = async () => {
    const all = await getAllOfflineInvoices();
    setPendingInvoices(all.filter(inv => inv.status !== 'synced'));
  };

  useEffect(() => {
    loadInvoices();
    const interval = setInterval(loadInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  if (pendingInvoices.length === 0) return null;

  const getStatusIcon = (status: OfflineInvoice['status']) => {
    switch (status) {
      case 'pending_sync': return <Clock size={16} className="text-gray-400" />;
      case 'syncing': return <Loader2 size={16} className="text-primary-500 animate-spin" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  const getStatusText = (status: OfflineInvoice['status']) => {
    switch (status) {
      case 'pending_sync': return 'Chờ đồng bộ';
      case 'syncing': return 'Đang xử lý...';
      case 'error': return 'Lỗi';
      default: return 'Đã xong';
    }
  };

  return (
    <>
      {/* Mini Widget */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 flex items-center gap-3 hover:scale-105 transition-all z-50 group"
      >
        <div className="bg-primary-50 text-primary-600 p-2 rounded-xl group-hover:bg-primary-100 transition-colors">
          <ClipboardList size={20} />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-gray-900">{pendingInvoices.length} HĐ chờ sync</p>
          <p className="text-[10px] text-gray-500">Click để xem chi tiết</p>
        </div>
      </button>

      {/* Detail Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                   <ClipboardList size={20} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900">Danh sách chờ đồng bộ</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900 hover:shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {pendingInvoices.map((inv) => (
                <div key={inv.id} className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-primary-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{inv.fileName}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(inv.capturedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                      {getStatusIcon(inv.status)}
                      <span className="text-[10px] font-bold text-gray-700">{getStatusText(inv.status)}</span>
                    </div>
                  </div>
                  
                  {inv.errorMessage && (
                    <p className="text-[10px] text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                      Lỗi: {inv.errorMessage}
                    </p>
                  )}

                  {inv.status === 'error' && (
                    <button 
                      onClick={() => deleteOfflineInvoice(inv.id)}
                      className="mt-3 text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Xóa bỏ
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
               <p className="text-xs text-center text-gray-500 italic">
                 Hệ thống sẽ tự động đồng bộ khi bạn có kết nối internet ổn định.
               </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

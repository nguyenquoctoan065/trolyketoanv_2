"use client";

import React, { useState, useEffect } from 'react';
import { 
  getPendingInvoices, 
  updateOfflineInvoiceStatus, 
  deleteOfflineInvoice,
  OfflineInvoice 
} from './lib/offlineDb';
import { useAppStore } from './store';
import { toast } from './components/Toast';
import { checkDuplicates } from './lib/utils';

export const OfflineSyncManager: React.FC = () => {
  const { state, actions } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncOfflineInvoices = async () => {
    if (isSyncing || !navigator.onLine) return;

    const pending = await getPendingInvoices();
    if (pending.length === 0) return;

    setIsSyncing(true);
    toast.info(`Đang đồng bộ ${pending.length} hóa đơn offline...`);

    for (const offlineInv of pending) {
      if (offlineInv.retryCount >= 3) {
        await updateOfflineInvoiceStatus(offlineInv.id, 'error', 'Vượt quá số lần thử lại (3)');
        continue;
      }

      try {
        await updateOfflineInvoiceStatus(offlineInv.id, 'syncing');

        const ext = offlineInv.fileName.split('.').pop()?.toLowerCase();
        let mimeType = offlineInv.imageBlob.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'heic') mimeType = 'image/heic';
        }

        const formData = new FormData();
        const file = new File([offlineInv.imageBlob], offlineInv.fileName, { type: mimeType });
        formData.append('file', file);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const duplicates = checkDuplicates(data, state.invoices);
        const isDuplicate = duplicates.length > 0;
        
        await actions.addInvoice({
          ...data,
          id: crypto.randomUUID(),
          original_file_url: data.original_file_url || URL.createObjectURL(offlineInv.imageBlob),
          original_file_name: offlineInv.fileName,
          created_at: Date.now(),
          status: 'pending_review',
          needs_review: data.needs_review || isDuplicate,
          notes: isDuplicate ? { value: `[CẢNH BÁO TRÙNG LẶP] ${data.notes?.value || ''}`, confidence: 'medium' } : data.notes
        });

        if (isDuplicate) {
          toast.warning(`Hóa đơn ${offlineInv.fileName} có thể bị trùng lặp, đã đánh dấu cần xem xét.`);
        }

        await deleteOfflineInvoice(offlineInv.id);
      } catch (error: any) {
        console.error(`Sync error for ${offlineInv.fileName}:`, error);
        await updateOfflineInvoiceStatus(offlineInv.id, 'error', error.message);
      }
    }

    setIsSyncing(false);
    toast.success('Đồng bộ hoàn tất!');
  };

  useEffect(() => {
    // Initial sync check
    syncOfflineInvoices();

    // Listen for online event
    const handleOnline = () => {
      setTimeout(() => {
        syncOfflineInvoices();
      }, 3000); // 3 second delay to ensure network is fully established
    };

    window.addEventListener('online', handleOnline);
    
    // Also periodically check if online
    const interval = setInterval(() => {
      if (navigator.onLine) syncOfflineInvoices();
    }, 60000); // Every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything UI-wise
};

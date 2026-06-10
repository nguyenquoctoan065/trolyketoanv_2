import { useEffect, useState, useCallback } from 'react';
import { getPendingInvoices, updateOfflineInvoiceStatus, deleteOfflineInvoice, OfflineInvoice } from './offlineDb';
import { useAppStore } from '../store';
import { toast } from '../components/Toast';
import { checkDuplicates } from './utils';
import { v4 as uuidv4 } from 'uuid';

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { state, actions } = useAppStore();

  const updatePendingCount = useCallback(async () => {
    const pending = await getPendingInvoices();
    setPendingCount(pending.length);
  }, []);

  const syncInvoices = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;

    const pending = await getPendingInvoices();
    if (pending.length === 0) return;

    setIsSyncing(true);
    toast.info(`Bắt đầu đồng bộ ${pending.length} hóa đơn offline...`);

    for (const inv of pending) {
      try {
        await updateOfflineInvoiceStatus(inv.id, 'syncing');

        const ext = inv.fileName.split('.').pop()?.toLowerCase();
        let mimeType = inv.imageBlob.type;
        if (!mimeType || mimeType === 'application/octet-stream') {
          if (ext === 'pdf') mimeType = 'application/pdf';
          else if (ext === 'png') mimeType = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
          else if (ext === 'webp') mimeType = 'image/webp';
          else if (ext === 'heic') mimeType = 'image/heic';
        }

        const file = new File([inv.imageBlob], inv.fileName, { type: mimeType });
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle duplicates logic (similar to UploadSection)
        const foundDuplicates = checkDuplicates(data, state.invoices);
        const invWithId = {
          ...data,
          id: uuidv4(),
          original_file_url: data.original_file_url || URL.createObjectURL(inv.imageBlob),
          original_file_name: inv.fileName,
          created_at: Date.now(),
          status: foundDuplicates.length > 0 ? 'pending_review' : 'pending_review' // status from prompt
        };

        await actions.addInvoice(invWithId);
        await deleteOfflineInvoice(inv.id);
        
      } catch (error: any) {
        console.error(`Sync error for ${inv.fileName}:`, error);
        await updateOfflineInvoiceStatus(inv.id, 'error', error.message);
        if (inv.retryCount >= 3) {
           // Move to a different status or notify user?
           // For now just leave as error
        }
      }
    }

    setIsSyncing(false);
    updatePendingCount();
    toast.success('Đồng bộ hoàn tất!');
  }, [isSyncing, state.invoices, actions, updatePendingCount]);

  useEffect(() => {
    updatePendingCount();

    const handleOnline = () => {
      syncInvoices();
    };

    window.addEventListener('online', handleOnline);
    
    // Also try to sync every minute if online
    const interval = setInterval(() => {
      if (navigator.onLine) syncInvoices();
      updatePendingCount();
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [syncInvoices, updatePendingCount]);

  return { isSyncing, pendingCount, syncInvoices, updatePendingCount };
};

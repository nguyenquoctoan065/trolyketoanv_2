import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OfflineInvoice {
  id: string;
  imageBlob: Blob;
  fileName: string;
  capturedAt: string;
  status: 'pending_sync' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
  retryCount: number;
}

interface InvoiceDB extends DBSchema {
  'pending-invoices': {
    key: string;
    value: OfflineInvoice;
    indexes: { 'by-status': string };
  };
}

const DB_NAME = 'invoice-offline';
const STORE_NAME = 'pending-invoices';

let dbPromise: Promise<IDBPDatabase<InvoiceDB>> | null = null;

const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<InvoiceDB>(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
        store.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
};

export const saveOfflineInvoice = async (file: File | Blob, fileName: string): Promise<string> => {
  const db = await getDB();
  if (!db) throw new Error('Database not available');

  const id = crypto.randomUUID();
  const offlineInvoice: OfflineInvoice = {
    id,
    imageBlob: file,
    fileName,
    capturedAt: new Date().toISOString(),
    status: 'pending_sync',
    retryCount: 0,
  };

  await db.put(STORE_NAME, offlineInvoice);
  return id;
};

export const getPendingInvoices = async (): Promise<OfflineInvoice[]> => {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex(STORE_NAME, 'by-status', 'pending_sync');
};

export const getAllOfflineInvoices = async (): Promise<OfflineInvoice[]> => {
  const db = await getDB();
  if (!db) return [];
  return db.getAll(STORE_NAME);
};

export const updateOfflineInvoiceStatus = async (
  id: string,
  status: OfflineInvoice['status'],
  errorMessage?: string
) => {
  const db = await getDB();
  if (!db) return;

  const invoice = await db.get(STORE_NAME, id);
  if (invoice) {
    invoice.status = status;
    if (errorMessage) invoice.errorMessage = errorMessage;
    if (status === 'error') invoice.retryCount += 1;
    await db.put(STORE_NAME, invoice);
  }
};

export const deleteOfflineInvoice = async (id: string) => {
  const db = await getDB();
  if (!db) return;
  await db.delete(STORE_NAME, id);
};

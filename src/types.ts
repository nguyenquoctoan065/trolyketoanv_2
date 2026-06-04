export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ExtractedField<T> {
  value: T | null;
  confidence: ConfidenceLevel;
}

export interface InvoiceItem {
  id?: string;
  description: ExtractedField<string>;
  quantity: ExtractedField<number>;
  unit_price: ExtractedField<number>;
  amount: ExtractedField<number>;
}

export interface InvoiceData {
  id: string; // Internal UUID
  original_file_url?: string; // Blob URL
  original_file_name?: string;
  created_at: number;
  
  status: 'pending_review' | 'confirmed' | 'rejected';
  
  invoice_date: ExtractedField<string>;
  invoice_number: ExtractedField<string>;
  vendor_name: ExtractedField<string>;
  vendor_tax_code: ExtractedField<string>;
  
  items: InvoiceItem[];
  
  vat_rate: ExtractedField<number>;
  subtotal: ExtractedField<number>;
  vat_amount: ExtractedField<number>;
  total: ExtractedField<number>;
  notes?: ExtractedField<string>;
  
  needs_review: boolean;
  is_demo?: boolean;
}

export interface AppState {
  invoices: InvoiceData[];
}

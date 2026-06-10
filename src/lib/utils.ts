import { InvoiceData } from "../types";
import { parse, parseISO, isValid } from 'date-fns';

export const parseInvoiceDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Try DD/MM/YYYY
  if (dateStr.includes('/')) {
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) return parsed;
  }
  
  // Try YYYY-MM-DD
  if (dateStr.includes('-')) {
    const parsed = parseISO(dateStr);
    if (isValid(parsed)) return parsed;
  }
  
  return null;
};

const getFieldString = (field: any): string | undefined => {
  if (field === null || field === undefined) return undefined;
  
  let val: any;
  if (typeof field === 'object' && field !== null && 'value' in field) {
    val = field.value;
  } else {
    val = field;
  }
  
  if (val === null || val === undefined) return undefined;
  const str = String(val).trim();
  if (str.toLowerCase() === 'null' || str === '') return undefined;
  return str;
};

const getTotalValue = (inv: any): number | undefined => {
  if (!inv) return undefined;
  
  if (inv.total !== undefined && inv.total !== null) {
    if (typeof inv.total === 'object' && inv.total !== null && 'value' in inv.total) {
      const val = inv.total.value;
      if (val !== null && val !== undefined && val !== 'null') return Number(val);
    } else {
      return Number(inv.total);
    }
  }
  
  if (inv.total_amount !== undefined && inv.total_amount !== null) {
    if (typeof inv.total_amount === 'object' && inv.total_amount !== null && 'value' in inv.total_amount) {
      const val = inv.total_amount.value;
      if (val !== null && val !== undefined && val !== 'null') return Number(val);
    } else {
      return Number(inv.total_amount);
    }
  }
  
  return undefined;
};

export const checkDuplicates = (newInv: any, existingInvoices: InvoiceData[]) => {
  const invNum = getFieldString(newInv.invoice_number);
  const taxCode = getFieldString(newInv.vendor_tax_code);
  const vendorName = getFieldString(newInv.vendor_name);
  const total = getTotalValue(newInv);

  console.log("Checking duplicates for:", { invNum, taxCode, vendorName, total });

  if (!invNum && !taxCode && !total) return [];

  return existingInvoices.filter(inv => {
    const existingNum = getFieldString(inv.invoice_number);
    const existingTax = getFieldString(inv.vendor_tax_code);
    const existingName = getFieldString(inv.vendor_name);
    const existingTotal = getTotalValue(inv);

    console.log("Comparing with existing:", { existingNum, existingTax, existingName, existingTotal });

    const isNumMatch = invNum && existingNum && String(invNum).toLowerCase() === String(existingNum).toLowerCase();
    const isTaxMatch = taxCode && existingTax && String(taxCode).toLowerCase() === String(existingTax).toLowerCase();
    const isNameMatch = vendorName && existingName && String(vendorName).toLowerCase() === String(existingName).toLowerCase();
    const isTotalMatch = total !== undefined && existingTotal !== undefined && Number(total) === Number(existingTotal);

    // Duplicate if Invoice Number matches AND at least one of (Tax Code, Vendor Name, or Total Amount) matches
    const isMatch = isNumMatch && (isTaxMatch || isNameMatch || isTotalMatch);
    
    console.log("Is match:", isMatch, { isNumMatch, isTaxMatch, isNameMatch, isTotalMatch });
    
    return isMatch;
  });
};

export const formatMoney = (val: number | null | undefined) => {
  if (val === null || val === undefined || isNaN(val)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export const formatDuplicateDate = (timestamp: any) => {
  if (!timestamp) return 'Không rõ ngày';
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return 'Lỗi ngày tháng';
  }
};

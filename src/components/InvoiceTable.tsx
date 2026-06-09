import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Download, Search, FileText, Filter } from 'lucide-react';
import * as xlsx from 'xlsx';
import { format, parse, parseISO, isValid, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { toast } from './Toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface InvoiceTableProps {
  startDate?: string;
  endDate?: string;
}

const parseInvoiceDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  if (dateStr.includes('/')) {
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) return parsed;
  }
  
  if (dateStr.includes('-')) {
    const parsed = parseISO(dateStr);
    if (isValid(parsed)) return parsed;
  }
  
  return null;
};

export default function InvoiceTable({ startDate: propStartDate = '', endDate: propEndDate = '' }: InvoiceTableProps = {}) {
  const { state } = useAppStore();
  const confirmedInvoices = state.invoices.filter(i => i.status === 'confirmed');
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [filterMonth, setFilterMonth] = useState('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [startDate, setStartDate] = useState(propStartDate);
  const [endDate, setEndDate] = useState(propEndDate);

  useEffect(() => {
    if (propStartDate) setStartDate(propStartDate);
  }, [propStartDate]);

  useEffect(() => {
    if (propEndDate) setEndDate(propEndDate);
  }, [propEndDate]);
  
  const tableRef = useRef<HTMLDivElement>(null);

  const filteredInvoices = confirmedInvoices.filter(inv => {
    const term = debouncedSearch.toLowerCase();
    const vendorMatch = String(inv.vendor_name?.value || '').toLowerCase().includes(term);
    const invoiceNumMatch = String(inv.invoice_number?.value || '').toLowerCase().includes(term);
    const notesMatch = String(inv.notes?.value || '').toLowerCase().includes(term);
    const taxMatch = String(inv.vendor_tax_code?.value || '').toLowerCase().includes(term);
    const itemsMatch = inv.items?.some(item => String(item.description?.value || '').toLowerCase().includes(term));
    const isSearchMatch = vendorMatch || invoiceNumMatch || notesMatch || taxMatch || itemsMatch;

    let isMonthMatch = true;
    if (filterMonth) {
      const dateVal = String(inv.invoice_date?.value || '');
      if (dateVal.includes('/')) {
        const parts = dateVal.split('/');
        if (parts.length >= 3) {
           const yyyyMM = `${parts[2]}-${parts[1].padStart(2, '0')}`;
           isMonthMatch = yyyyMM === filterMonth;
        } else {
           isMonthMatch = false; 
        }
      } else if (dateVal.includes('-')) {
        isMonthMatch = dateVal.startsWith(filterMonth);
      } else {
        isMonthMatch = false;
      }
    }

    let isAmountMatch = true;
    const total = inv.total?.value || 0;
    if (minAmount && !isNaN(Number(minAmount))) {
       if (total < Number(minAmount)) isAmountMatch = false;
    }
    if (maxAmount && !isNaN(Number(maxAmount))) {
       if (total > Number(maxAmount)) isAmountMatch = false;
    }

    let isDateRangeMatch = true;
    if (startDate || endDate) {
      const invDate = parseInvoiceDate(inv.invoice_date?.value || '');
      if (invDate) {
        if (startDate) {
          const start = startOfDay(parseISO(startDate));
          if (isBefore(invDate, start)) {
            isDateRangeMatch = false;
          }
        }
        if (endDate) {
          const end = endOfDay(parseISO(endDate));
          if (isAfter(invDate, end)) {
            isDateRangeMatch = false;
          }
        }
      } else {
        isDateRangeMatch = false;
      }
    }

    return isSearchMatch && isMonthMatch && isAmountMatch && isDateRangeMatch;
  });

  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) return;

    const data = filteredInvoices.map((inv, index) => ({
      'STT': index + 1,
      'Ngày hóa đơn': inv.invoice_date?.value || '',
      'Số hóa đơn': inv.invoice_number?.value || '',
      'Tên nhà cung cấp': inv.vendor_name?.value || '',
      'Mã số thuế': inv.vendor_tax_code?.value || '',
      'Tổng trước thuế': inv.subtotal?.value || 0,
      'Thuế suất VAT (%)': inv.vat_rate?.value || 0,
      'Tiền thuế': inv.vat_amount?.value || 0,
      'Tổng tiền sau thuế': inv.total?.value || 0,
      'Ghi chú': inv.notes?.value || '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'HoaDon');

    const fileName = `ExportHoadon_${format(new Date(), 'dd_MM_yyyy')}.xlsx`;
    xlsx.writeFile(workbook, fileName);
    toast.success('Đã xuất file Excel!');
  };

  const handleExportPDF = async () => {
    if (filteredInvoices.length === 0) return;
    toast.success('Đang tạo báo cáo PDF chuyên nghiệp...');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Fetch a standard true type font that supports Vietnamese (Roboto)
      const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
      const fontResponse = await fetch(fontUrl);
      if (!fontResponse.ok) {
         throw new Error('Could not load font for PDF export');
      }
      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBase64 = btoa(
        new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      pdf.addFileToVFS('Roboto-Regular.ttf', fontBase64);
      pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      pdf.setFont('Roboto');

      // Add a bold font for headers
      const boldFontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf';
      const boldFontResponse = await fetch(boldFontUrl);
      if (boldFontResponse.ok) {
        const boldFontBuffer = await boldFontResponse.arrayBuffer();
        const boldFontBase64 = btoa(
          new Uint8Array(boldFontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        pdf.addFileToVFS('Roboto-Medium.ttf', boldFontBase64);
        pdf.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
      }

      // Title
      pdf.setFontSize(20);
      pdf.setFont('Roboto', 'bold');
      pdf.setTextColor(31, 41, 55); // Gray 800
      pdf.text('BÁO CÁO TỔNG HỢP HÓA ĐƠN', 14, 22);
      
      // Subtitle
      pdf.setFontSize(11);
      pdf.setFont('Roboto', 'normal');
      pdf.setTextColor(107, 114, 128); // Gray 500
      pdf.text(`Ngày xuất báo cáo: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
      
      let dateRangeStr = 'Tất cả';
      if (startDate && endDate) {
        dateRangeStr = `${format(parseISO(startDate), 'dd/MM/yyyy')} - ${format(parseISO(endDate), 'dd/MM/yyyy')}`;
      } else if (startDate) {
        dateRangeStr = `Từ ${format(parseISO(startDate), 'dd/MM/yyyy')}`;
      } else if (endDate) {
        dateRangeStr = `Đến ${format(parseISO(endDate), 'dd/MM/yyyy')}`;
      }
      pdf.text(`Khoảng thời gian: ${dateRangeStr}`, 14, 36);
      pdf.text(`Tổng số lượng hóa đơn: ${filteredInvoices.length}`, 14, 42);

      // Total summary
      const totalSum = filteredInvoices.reduce((acc, curr) => acc + (curr.total?.value || 0), 0);
      pdf.setFont('Roboto', 'bold');
      pdf.setTextColor(37, 99, 235); // Blue 600
      pdf.text(`Tổng giá trị thanh toán: ${formatMoney(totalSum)} VNĐ`, 14, 48);

      const tableData = filteredInvoices.map((inv, index) => [
        index + 1,
        inv.invoice_date?.value || '-',
        inv.invoice_number?.value || '-',
        inv.vendor_name?.value || '-',
        inv.vendor_tax_code?.value || '-',
        formatMoney(inv.subtotal?.value),
        formatMoney(inv.vat_amount?.value),
        formatMoney(inv.total?.value)
      ]);

      autoTable(pdf, {
        startY: 56,
        head: [['STT', 'Ngày HĐ', 'Số HĐ', 'Nhà cung cấp', 'MST', 'Trước thuế', 'Thuế VAT', 'Thanh toán']],
        body: tableData as string[][],
        theme: 'grid',
        styles: { 
          font: 'Roboto', 
          fontSize: 9,
          textColor: [55, 65, 81], // Gray 700
          cellPadding: 4,
          lineColor: [229, 231, 235], // Gray 200
          lineWidth: 0.1,
        },
        headStyles: { 
          fillColor: [248, 250, 252], // Slate 50
          textColor: [30, 41, 59], // Slate 800
          fontStyle: 'bold',
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250] // Gray 50/30
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 24, fontStyle: 'bold' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 22 },
          5: { cellWidth: 25, halign: 'right' },
          6: { cellWidth: 22, halign: 'right' },
          7: { cellWidth: 25, halign: 'right', fontStyle: 'bold', textColor: [17, 24, 39] },
        },
        didDrawPage: function (data) {
          // Footer
          pdf.setFontSize(9);
          pdf.setFont('Roboto', 'normal');
          pdf.setTextColor(156, 163, 175);
          const pageSize = pdf.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          pdf.text(`Trang ${data.pageNumber}`, data.settings.margin.left, pageHeight - 10);
        }
      });
      
      pdf.save(`BaoCao_HoaDon_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
      toast.success(`Đã in ${filteredInvoices.length} hóa đơn ra PDF.`);
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra tải phông chữ tiếng Việt cho PDF.');
    }
  };

  const formatMoney = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-gray-800">Khám phá dữ liệu</h2>
          <p className="text-sm text-gray-500 mt-1">Đang hiển thị {filteredInvoices.length} hóa đơn từ kho lưu trữ</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group flex-1 sm:flex-none w-full sm:w-auto min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm số HĐ, NCC, MST..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50/50"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors cursor-pointer ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
            >
               <Filter size={16} /> <span className="hidden sm:inline">Bộ lọc nâng cao</span>
            </button>
            
            <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto ml-auto">
              <span className="text-xs text-gray-500 font-medium mr-1 select-none">
                Sẽ xuất {filteredInvoices.length} bản ghi
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleExportPDF}
                  disabled={filteredInvoices.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  <FileText size={16} />
                  <span className="hidden sm:inline">Xuất PDF</span>
                </button>
                <button 
                  onClick={handleExportExcel}
                  disabled={filteredInvoices.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-primary-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <Download size={16} />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
             <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5 w-full sm:w-auto">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tháng hóa đơn</label>
                   <input 
                     type="month"
                     value={filterMonth}
                     onChange={(e) => setFilterMonth(e.target.value)}
                     className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                   />
                </div>
                <div className="space-y-1.5 w-full sm:w-auto">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền từ</label>
                   <div className="relative">
                     <input 
                       type="number"
                       placeholder="0"
                       value={minAmount}
                       onChange={(e) => setMinAmount(e.target.value)}
                       className="px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                     />
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₫</span>
                   </div>
                </div>
                <div className="space-y-1.5 w-full sm:w-auto">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đến</label>
                   <div className="relative">
                     <input 
                       type="number"
                       placeholder="10000000"
                       value={maxAmount}
                       onChange={(e) => setMaxAmount(e.target.value)}
                       className="px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                     />
                     <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">₫</span>
                   </div>
                </div>
                <div className="space-y-1.5 w-full sm:w-auto">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Từ ngày</label>
                   <input 
                     type="date"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                     className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                   />
                </div>
                <div className="space-y-1.5 w-full sm:w-auto">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đến ngày</label>
                   <input 
                     type="date"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                     className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 bg-white"
                   />
                </div>
                <button 
                  onClick={() => { setFilterMonth(''); setMinAmount(''); setMaxAmount(''); setSearchTerm(''); setStartDate(''); setEndDate(''); }}
                  className="px-4 py-2 mt-auto text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg font-medium transition-colors w-full sm:w-auto text-center"
                >
                   Xóa thiết lập bộ lọc
                </button>
             </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-b-2xl bg-white" ref={tableRef}>
        <table className="w-full text-left border-collapse text-sm min-w-max">
          <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
            <tr>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider bg-gray-50/80">STT</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap bg-gray-50/80">Ngày HĐ</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap bg-gray-50/80">Số HĐ</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider bg-gray-50/80">Nhà cung cấp</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider bg-gray-50/80">MST</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider text-right bg-gray-50/80">Trước thuế</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider text-right bg-gray-50/80">Thuế VAT</th>
              <th className="py-4 px-6 text-xs text-gray-500 font-semibold uppercase tracking-wider text-right bg-gray-50/80">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv, idx) => (
                <tr key={inv.id} className="hover:bg-primary-50/40 transition-colors group">
                  <td className="py-4 px-6 text-gray-400 group-hover:text-primary-600">{idx + 1}</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{String(inv.invoice_date?.value || '-')}</td>
                  <td className="py-4 px-6 text-gray-900 font-semibold">
                     <div className="inline-flex items-center px-2 py-1 rounded bg-gray-100 group-hover:bg-white text-xs whitespace-nowrap">{String(inv.invoice_number?.value || '-')}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-800 font-medium">{String(inv.vendor_name?.value || '-')}</td>
                  <td className="py-4 px-6 text-gray-500 whitespace-nowrap font-mono text-xs max-w-[120px] truncate" title={String(inv.vendor_tax_code?.value || '')}>
                     {String(inv.vendor_tax_code?.value || '-')}
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-right">{formatMoney(inv.subtotal?.value)}</td>
                  <td className="py-4 px-6 text-gray-600 text-right">{formatMoney(inv.vat_amount?.value)}</td>
                  <td className="py-4 px-6 text-gray-900 font-bold text-right">{formatMoney(inv.total?.value)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-20 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-10 h-10 mb-3 text-gray-300" />
                    <p className="text-base font-medium text-gray-600">Không tìm thấy dữ liệu.</p>
                    <p className="text-sm mt-1">Thử thay đổi điều kiện bộ lọc hoặc từ khóa tìm kiếm.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer totals */}
      <div className="bg-gray-50/80 border-t border-gray-100 p-4 sm:p-5 sm:pl-6 flex flex-col sm:flex-row justify-between items-center rounded-b-2xl gap-3">
         <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">Dữ liệu được làm mới từ Bộ lọc hiện tại</span>
         <div className="text-right flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Tổng hiển thị:</span>
            <span className="text-xl font-display font-bold text-primary-600 bg-white px-4 py-1.5 rounded-lg border border-primary-100 shadow-sm whitespace-nowrap">
              {formatMoney(filteredInvoices.reduce((acc, curr) => acc + (curr.total?.value || 0), 0))} VNĐ
            </span>
         </div>
      </div>
    </div>
  );
}

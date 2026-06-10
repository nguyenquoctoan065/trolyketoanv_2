'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Download, Search, FileText, Filter, Loader2, Calendar, Trash2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { format, parse, parseISO, isValid, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { parseInvoiceDate } from '../lib/utils';
import { toast } from './Toast';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

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
  onDeleteDemo: () => void;
}

// ... (parseInvoiceDate) ...

export default function InvoiceTable({ startDate: propStartDate = '', endDate: propEndDate = '', onDeleteDemo }: InvoiceTableProps) {
  const { state, actions } = useAppStore();
  const confirmedInvoices = state.invoices.filter(i => i.status === 'confirmed');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(i => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sId => sId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await actions.deleteInvoice(id);
    }
    setSelectedIds([]);
    toast.success(`Đã xóa ${selectedIds.length} hóa đơn.`);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [filterMonth, setFilterMonth] = useState('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [startDate, setStartDate] = useState(propStartDate);
  const [endDate, setEndDate] = useState(propEndDate);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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

  const handleExportExcel = async (invoicesToExport: typeof filteredInvoices) => {
    if (invoicesToExport.length === 0) return;
    setIsExportingExcel(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Bao_Cao_Hoa_Don');

      // Set default row height
      worksheet.properties.defaultRowHeight = 20;

      // 1. Title Section
      worksheet.mergeCells('A1:J1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'BÁO CÁO CHI TIẾT HÓA ĐƠN';
      titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1D9E75' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.mergeCells('A2:J2');
      const subTitleCell = worksheet.getCell('A2');
      subTitleCell.value = `Trích xuất từ hệ thống AccoBot - Trợ lý Kế toán AI`;
      subTitleCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF64748B' } };
      subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

      worksheet.addRow([]); // Gap

      // 2. Info Section
      worksheet.addRow(['Ngày xuất báo cáo:', format(new Date(), 'dd/MM/yyyy HH:mm'), '', '', 'Tổng số hóa đơn:', invoicesToExport.length]);
      worksheet.getRow(4).font = { bold: true, size: 10 };
      worksheet.addRow([]); // Gap

      // 3. Header Row
      const headers = [
        'STT',
        'Ngày hóa đơn',
        'Số hóa đơn',
        'Nhà cung cấp',
        'Mã số thuế',
        'Trước thuế (VNĐ)',
        'VAT (%)',
        'Tiền thuế (VNĐ)',
        'Tổng cộng (VNĐ)',
        'Ghi chú'
      ];
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 30;

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1D9E75' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF0D7E55' } },
          left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'medium', color: { argb: 'FF0D7E55' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
        };
      });

      // 4. Data Rows
      let totalAmount = 0;
      let totalVat = 0;
      let totalSubtotal = 0;

      invoicesToExport.forEach((inv, index) => {
        const rowValues = [
          index + 1,
          inv.invoice_date?.value || '',
          inv.invoice_number?.value || '',
          inv.vendor_name?.value || '',
          inv.vendor_tax_code?.value || '',
          inv.subtotal?.value || 0,
          inv.vat_rate?.value || 0,
          inv.vat_amount?.value || 0,
          inv.total?.value || 0,
          inv.notes?.value || '',
        ];

        const row = worksheet.addRow(rowValues);
        row.height = 25;

        totalSubtotal += Number(inv.subtotal?.value || 0);
        totalVat += Number(inv.vat_amount?.value || 0);
        totalAmount += Number(inv.total?.value || 0);

        // Style cells
        row.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle' };
          cell.font = { size: 10 };

          if ([1, 2, 3, 5, 7].includes(colNumber)) {
            cell.alignment.horizontal = 'center';
          }

          // Currency formatting
          if ([6, 8, 9].includes(colNumber)) {
            cell.numFmt = '#,##0 "₫"';
            cell.alignment.horizontal = 'right';
            if (colNumber === 9) cell.font = { bold: true, color: { argb: 'FF111827' } };
          }

          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });

        // Alternating row background
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        }
      });

      // 5. Summary Row
      worksheet.addRow([]); // Gap
      const summaryRow = worksheet.addRow([
        '', '', '', '', 'TỔNG CỘNG:', totalSubtotal, '', totalVat, totalAmount, ''
      ]);
      summaryRow.height = 30;
      summaryRow.font = { bold: true, size: 11 };

      summaryRow.eachCell((cell, colNumber) => {
        if (colNumber >= 5 && colNumber <= 9) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' }
          };
          cell.border = {
            top: { style: 'medium', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'medium', color: { argb: 'FFCBD5E1' } }
          };
        }
        if ([6, 8, 9].includes(colNumber)) {
          cell.numFmt = '#,##0 "₫"';

          cell.alignment = {
            horizontal: 'right'
          };
        }
        if (colNumber === 9) {
          cell.font = { bold: true, color: { argb: 'FF1D9E75' }, size: 12 };
        }
      });

      // 6. Final Footer
      worksheet.addRow([]);
      const footerRow = worksheet.addRow(['', 'Người lập biểu', '', '', '', '', '', 'Kế toán trưởng']);
      footerRow.font = { italic: true, bold: true };
      worksheet.addRow(['', '(Ký và ghi rõ họ tên)', '', '', '', '', '', '(Ký và ghi rõ họ tên)']);

      // Column widths
      worksheet.getColumn(1).width = 6;   // STT
      worksheet.getColumn(2).width = 15;  // Ngày
      worksheet.getColumn(3).width = 15;  // Số HĐ
      worksheet.getColumn(4).width = 45;  // Vendor
      worksheet.getColumn(5).width = 18;  // MST
      worksheet.getColumn(6).width = 20;  // Trước thuế
      worksheet.getColumn(7).width = 10;  // VAT %
      worksheet.getColumn(8).width = 20;  // Tiền thuế
      worksheet.getColumn(9).width = 25;  // Tổng cộng
      worksheet.getColumn(10).width = 30; // Ghi chú

      // Freeze top rows
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 6, topLeftCell: 'A7', activeCell: 'A7' }
      ];

      // Export
      // Export
      console.log("Before writeBuffer");

      const buffer = await workbook.xlsx.writeBuffer();

      console.log("After writeBuffer");

      const fileName = `BaoCao_KeToan_AccoBot_${format(new Date(), 'dd_MM_yyyy')}.xlsx`;

      saveAs(new Blob([buffer]), fileName);

      toast.success('Đã xuất file Excel định dạng kế toán chuyên nghiệp!');
    } catch (error) {
      console.error('Excel Export Error (detailed):', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error('Lỗi khi tạo file Excel. Xem console để biết chi tiết.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async (invoicesToExport: typeof filteredInvoices) => {
    if (invoicesToExport.length === 0) return;
    setIsExportingPDF(true);
    toast.success('Đang tạo báo cáo PDF chuyên nghiệp...');

    try {
      console.log("jsPDF =", jsPDF);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.width;

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

      // --- PDF Header ---
      pdf.setFillColor(29, 158, 117); // Primary 500
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(26);
      pdf.setFont('Roboto', 'bold');
      pdf.text('AccoBot', 14, 22);

      pdf.setFontSize(10);
      pdf.setFont('Roboto', 'normal');
      pdf.setTextColor(255, 255, 255);
      pdf.text('HỆ THỐNG QUẢN LÝ HÓA ĐƠN THÔNG MINH', 14, 30);

      pdf.setFontSize(14);
      pdf.setFont('Roboto', 'bold');
      pdf.text('BÁO CÁO TỔNG HỢP', pageWidth - 14, 22, { align: 'right' });

      pdf.setFontSize(9);
      pdf.setFont('Roboto', 'normal');
      pdf.text(`Ngày in: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 14, 30, { align: 'right' });

      // --- Summary Section ---
      let currentY = 50;

      pdf.setFontSize(12);
      pdf.setFont('Roboto', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('TỔNG QUAN DỮ LIỆU', 14, currentY);

      currentY += 8;

      const boxWidth = (pageWidth - 28 - 10) / 3;
      const boxHeight = 22;

      // Box 1: Count
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, currentY, boxWidth, boxHeight, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('SỐ LƯỢNG HÓA ĐƠN', 14 + boxWidth / 2, currentY + 7, { align: 'center' });
      pdf.setFontSize(13);
      pdf.setFont('Roboto', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(`${invoicesToExport.length}`, 14 + boxWidth / 2, currentY + 16, { align: 'center' });

      // Box 2: Subtotal
      const subtotalSum = invoicesToExport.reduce((acc, curr) => acc + (curr.subtotal?.value || 0), 0);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14 + boxWidth + 5, currentY, boxWidth, boxHeight, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setFont('Roboto', 'normal');
      pdf.setTextColor(107, 114, 128);
      pdf.text('TỔNG TRƯỚC THUẾ', 14 + boxWidth + 5 + boxWidth / 2, currentY + 7, { align: 'center' });
      pdf.setFontSize(11);
      pdf.setFont('Roboto', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(`${formatMoneyPlain(subtotalSum)} đ`, 14 + boxWidth + 5 + boxWidth / 2, currentY + 16, { align: 'center' });

      // Box 3: Total
      const totalSum = invoicesToExport.reduce((acc, curr) => acc + (curr.total?.value || 0), 0);
      pdf.setFillColor(231, 246, 241); // Primary 50
      pdf.roundedRect(14 + (boxWidth + 5) * 2, currentY, boxWidth, boxHeight, 3, 3, 'F');
      pdf.setFontSize(8);
      pdf.setFont('Roboto', 'normal');
      pdf.setTextColor(21, 121, 91); // Primary 600
      pdf.text('TỔNG THANH TOÁN', 14 + (boxWidth + 5) * 2 + boxWidth / 2, currentY + 7, { align: 'center' });
      pdf.setFontSize(11);
      pdf.setFont('Roboto', 'bold');
      pdf.setTextColor(17, 98, 75); // Primary 700
      pdf.text(`${formatMoneyPlain(totalSum)} đ`, 14 + (boxWidth + 5) * 2 + boxWidth / 2, currentY + 16, { align: 'center' });

      currentY += boxHeight + 12;

      const tableData = invoicesToExport.map((inv, index) => [
        index + 1,
        inv.invoice_date?.value || '-',
        inv.invoice_number?.value || '-',
        inv.vendor_name?.value || '-',
        inv.vendor_tax_code?.value || '-',
        formatMoneyPlain(inv.subtotal?.value),
        formatMoneyPlain(inv.vat_amount?.value),
        formatMoneyPlain(inv.total?.value)
      ]);

      autoTable(pdf, {
        startY: currentY,
        head: [['STT', 'Ngày HĐ', 'Số HĐ', 'Nhà cung cấp', 'MST', 'Trước thuế', 'VAT', 'Tổng cộng']],
        body: tableData as string[][],
        theme: 'grid',
        styles: {
          font: 'Roboto',
          fontSize: 8,
          textColor: [51, 65, 85],
          cellPadding: 3.5,
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [29, 158, 117],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 22, fontStyle: 'bold', halign: 'center' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 24, halign: 'right' },
          6: { cellWidth: 18, halign: 'right' },
          7: { cellWidth: 24, halign: 'right', fontStyle: 'bold', textColor: [29, 78, 216] },
        },
        didDrawPage: (data) => {
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          const pageHeight = pdf.internal.pageSize.height;
          pdf.text('© 2026 AccoBot - Trợ lý Kế toán AI thông minh', 14, pageHeight - 10);
          pdf.text(`Trang ${data.pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        }
      });

      pdf.save(`BaoCao_AccoBot_${format(new Date(), 'dd_MM_yyyy')}.pdf`);
      toast.success('Báo cáo PDF đã được tải xuống.');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xuất PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const formatMoneyPlain = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const formatMoney = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val)) return '-';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 h-full flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden">
      {/* Search & Action Bar */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/30 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-primary-500 rounded-full"></div>
            <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">Kho dữ liệu đã duyệt</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-5">Hệ thống đang quản lý <span className="text-primary-600 font-bold">{filteredInvoices.length}</span> hóa đơn hợp lệ</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative group w-full md:w-80">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm số HĐ, nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl text-sm w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all bg-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 border-2 rounded-2xl text-sm font-bold transition-all active:scale-95 ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-inner' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600 shadow-sm'}`}
            >
              <Filter size={18} /> <span>Bộ lọc</span>
            </button>

            <div className="h-10 w-[2px] bg-gray-200 mx-2 hidden md:block"></div>

            <div className="flex items-center gap-2 flex-[2] md:flex-none">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 size={18} />
                <span>Xóa đã chọn</span>
              </button>
              <button
                onClick={() => handleExportPDF(selectedIds.length > 0 ? filteredInvoices.filter(i => selectedIds.includes(i.id)) : filteredInvoices)}
                disabled={filteredInvoices.length === 0 || isExportingPDF}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-40"
              >
                {isExportingPDF ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExportExcel(selectedIds.length > 0 ? filteredInvoices.filter(i => selectedIds.includes(i.id)) : filteredInvoices)}
                disabled={filteredInvoices.length === 0 || isExportingExcel}
                className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-gray-900/10 active:scale-95 disabled:opacity-40"
              >
                {isExportingExcel ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>XUẤT EXCEL</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-primary-50/50 p-6 border-b border-primary-100 flex flex-wrap gap-6 items-end animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-2 flex-1 min-w-[180px]">
            <label className="flex items-center gap-2 text-[10px] font-black text-primary-700 uppercase tracking-widest ml-1">
              <Calendar size={12} /> Tháng báo cáo
            </label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-3 border-2 border-white rounded-xl text-sm w-full focus:outline-none focus:border-primary-400 text-gray-700 bg-white shadow-sm"
            />
          </div>
          <div className="space-y-2 flex-1 min-w-[180px]">
            <label className="flex items-center gap-2 text-[10px] font-black text-primary-700 uppercase tracking-widest ml-1">Số tiền từ</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="px-4 py-3 pr-10 border-2 border-white rounded-xl text-sm w-full focus:outline-none focus:border-primary-400 text-gray-700 bg-white shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₫</span>
            </div>
          </div>
          <div className="space-y-2 flex-1 min-w-[180px]">
            <label className="flex items-center gap-2 text-[10px] font-black text-primary-700 uppercase tracking-widest ml-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-3 border-2 border-white rounded-xl text-sm w-full focus:outline-none focus:border-primary-400 text-gray-700 bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => { setFilterMonth(''); setMinAmount(''); setMaxAmount(''); setSearchTerm(''); setStartDate(''); setEndDate(''); }}
            className="px-6 py-3 text-sm text-gray-500 hover:text-red-600 font-bold transition-colors mb-0.5"
          >
            Đặt lại mặc định
          </button>
        </div>
      )}

      {/* Table Section */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar" ref={tableRef}>
        <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white">STT</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white">Ngày HĐ</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white">Số HĐ</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white">Nhà cung cấp</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] bg-white">Mã số thuế</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] text-right bg-white">Trước thuế</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] text-right bg-white">Thuế VAT</th>
              <th className="py-5 px-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] text-right bg-white">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv, idx) => (
                <tr key={inv.id} className="hover:bg-primary-50/30 transition-all duration-200 group">
                  <td className="py-5 px-6">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inv.id)}
                      onChange={() => toggleSelectOne(inv.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-5 px-6 text-gray-300 font-bold">{idx + 1}</td>
                  <td className="py-5 px-6 text-gray-600 font-bold whitespace-nowrap">{String(inv.invoice_date?.value || '-')}</td>
                  <td className="py-5 px-6">
                    <span className="inline-block px-3 py-1 rounded-lg bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-200 text-gray-900 font-black text-xs transition-all">
                      {String(inv.invoice_number?.value || '-')}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-gray-900 font-bold max-w-[250px] truncate">{String(inv.vendor_name?.value || '-')}</td>
                  <td className="py-5 px-6">
                    <span className="text-gray-500 font-mono text-xs tracking-tight">{String(inv.vendor_tax_code?.value || '-')}</span>
                  </td>
                  <td className="py-5 px-6 text-gray-600 text-right font-medium">{formatMoney(inv.subtotal?.value)}</td>
                  <td className="py-5 px-6 text-gray-600 text-right font-medium">{formatMoney(inv.vat_amount?.value)}</td>
                  <td className="py-5 px-6 text-right">
                    <span className="text-gray-900 font-black text-base">{formatMoney(inv.total?.value)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-32 text-center">
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <Search className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-lg font-bold text-gray-600">Không tìm thấy dữ liệu phù hợp</p>
                    <p className="text-sm">Hãy thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-white border-t border-gray-100 p-6 md:px-10 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Download size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Sẵn sàng xuất</p>
            <p className="text-sm font-bold text-gray-900">{filteredInvoices.length} bản ghi thỏa mãn điều kiện</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-gray-900 px-8 py-4 rounded-[2rem] shadow-2xl shadow-gray-900/20">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Tổng giá trị hiển thị:</span>
          <span className="text-2xl font-display font-black text-white">
            {formatMoney(filteredInvoices.reduce((acc, curr) => acc + (curr.total?.value || 0), 0))} <span className="text-sm text-white/60 ml-1">VNĐ</span>
          </span>
        </div>
      </div>
    </div>
  );
}

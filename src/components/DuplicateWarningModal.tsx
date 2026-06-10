import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { formatMoney, formatDuplicateDate } from '../lib/utils';

interface DuplicateWarningModalProps {
  pendingInvoice: any;
  duplicates: any[];
  onResolve: (shouldAdd: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase">Đã duyệt</span>;
    case 'pending_review':
      return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">Chờ duyệt</span>;
    default:
      return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">{status}</span>;
  }
};

export default function DuplicateWarningModal({ pendingInvoice, duplicates, onResolve }: DuplicateWarningModalProps) {
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  return (
    <div id="duplicate-modal" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start gap-4 bg-[#FFFDF6]">
          <div className="p-2.5 bg-amber-100 rounded-xl text-[#D97706] flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              Phát hiện hóa đơn có thể trùng lặp
            </h3>
            <p className="text-xs text-amber-800 mt-1 font-medium">
              Hệ thống tìm thấy hóa đơn có thông tin tương tự trong kho dữ liệu.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 select-none">

          {/* Current Invoice Data */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">Hóa đơn đang tải lên:</div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-gray-500 block">Số Hóa Đơn</span>
                <strong className="text-gray-900 font-semibold text-sm">{pendingInvoice.invoice_number?.value || '(Trống)'}</strong>
              </div>
              <div>
                <span className="text-gray-500 block">Tổng tiền thanh toán</span>
                <strong className="text-emerald-700 font-bold text-sm">
                  {formatMoney(pendingInvoice.total?.value || 0)}
                </strong>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block">Nhà cung cấp</span>
                <strong className="text-gray-900 font-semibold">{pendingInvoice.vendor_name?.value || '(Trống)'}</strong>
              </div>
            </div>
          </div>

          {/* Explanatory Message */}
          <p className="text-xs text-[#475569] leading-relaxed">
            Hóa đơn này có vẻ đã được thêm trước đó. Hãy so sánh với danh sách hóa đơn trùng khớp dưới đây trước khi đưa ra quyết định:
          </p>

          {/* List of Duplicates (Max 3) */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">Danh sách hóa đơn trùng (Tối đa 3)</div>
            <div className="space-y-2">
              {duplicates.slice(0, 3).map((dup) => {
                const dupNum = typeof dup.invoice_number === 'object' && dup.invoice_number !== null
                  ? dup.invoice_number.value
                  : dup.invoice_number;
                const dupName = typeof dup.vendor_name === 'object' && dup.vendor_name !== null
                  ? dup.vendor_name.value
                  : dup.vendor_name;
                const dupTotal = typeof dup.total === 'object' && dup.total !== null
                  ? dup.total.value
                  : typeof dup.total_amount === 'number'
                    ? dup.total_amount
                    : (dup.total || 0);

                const isExpanded = activePreviewId === dup.id;

                return (
                  <div key={dup.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200">
                    <div className="bg-white p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 font-mono text-sm">{dupNum || '(Không có số)'}</span>
                          {getStatusBadge(dup.status)}
                        </div>
                        <div className="text-gray-500 truncate">{dupName || 'Không có tên'}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActivePreviewId(isExpanded ? null : dup.id)}
                          className="px-2.5 py-1 text-xs border border-gray-300 hover:border-[#1B52CC] hover:text-[#1B52CC] rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-1"
                        >
                          {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                          <span>{isExpanded ? 'Ẩn' : 'Xem'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible expanded detail */}
                    {isExpanded && (
                      <div className="bg-[#F8F9FC] border-t border-gray-200 p-3.5 text-xs grid grid-cols-2 gap-2 animate-in fade-in duration-200 select-text">
                        <div>
                          <span className="text-gray-400 block">Ngày tạo lập</span>
                          <span className="font-semibold text-gray-900">{formatDuplicateDate(dup.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Số tiền lập</span>
                          <span className="font-bold text-emerald-700">
                            {formatMoney(Number(dupTotal))}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 block">Mã số thuế / Nhà cung cấp</span>
                          <span className="font-semibold text-gray-900">{dup.vendor_tax_code?.value || dup.vendor_tax_code || 'Chưa cung cấp'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-[#F8F9FC] flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={() => onResolve(false)}
            className="px-4 py-2 bg-white border border-gray-300 text-[#475569] hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer leading-none"
            style={{ height: '38px' }}
          >
            Bỏ qua, không thêm
          </button>

          <button
            type="button"
            onClick={() => onResolve(true)}
            className="px-4 py-2 border border-red-500 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer leading-none hover:shadow-sm"
            style={{ height: '38px' }}
          >
            Vẫn thêm mới
          </button>
        </div>

      </div>
    </div>
  );
}

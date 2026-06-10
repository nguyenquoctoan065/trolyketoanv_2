import React, { useState } from 'react';
import { useAppStore } from '../store';
import { InvoiceData, ExtractedField } from '../types';
import { Check, X, AlertTriangle, ChevronLeft, ChevronRight, Save, FileText } from 'lucide-react';
import { toast } from './Toast';

export default function ReviewQueue() {
  const { state, dispatch, actions } = useAppStore();
  const pendingInvoices = state.invoices.filter(i => i.status === 'pending_review');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (pendingInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-gray-500 animate-in fade-in zoom-in-95 duration-500 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="bg-primary-50 p-8 rounded-full mb-6 relative">
          <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-30"></div>
          <Check className="w-20 h-20 text-primary-500 relative z-10" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Tuyệt vời!</h2>
        <p className="text-gray-500 text-lg max-w-md text-center px-6 leading-relaxed">
          Tất cả hóa đơn đã được xử lý xong. Bạn có thể xem lại tại tab <span className="font-bold text-primary-600">Dữ liệu đã duyệt</span>.
        </p>
      </div>
    );
  }

  // Ensure current index is valid
  const currentInvoice = pendingInvoices[currentIndex] || pendingInvoices[0];

  const handleUpdateField = (field: keyof InvoiceData, value: any) => {
    dispatch({
      type: 'UPDATE_INVOICE',
      payload: { ...currentInvoice, [field]: { ...currentInvoice[field as keyof InvoiceData] as any, value, confidence: 'high' } }
    });
  };

  const handleUpdateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = [...currentInvoice.items];
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [field]: { ...(newItems[itemIndex] as any)[field], value, confidence: 'high' }
    };
    dispatch({
      type: 'UPDATE_INVOICE',
      payload: { ...currentInvoice, items: newItems }
    });
  };

  const handleStatusChange = async (status: 'confirmed' | 'rejected') => {
    try {
      const updatedInvoice = { ...currentInvoice, status };
      await actions.updateInvoice(updatedInvoice);
      toast.success(status === 'confirmed' ? "Đã xác nhận hóa đơn" : "Đã loại bỏ hóa đơn");

      if (currentIndex > 0 && currentIndex >= pendingInvoices.length - 1) {
        setCurrentIndex(currentIndex - 1);
      }
    } catch (err: any) {
      console.error("Error updating status in Supabase:", err);
    }
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-primary-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-primary-500/20">
            {currentIndex + 1}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">Kiểm soát chất lượng (OCR)</h2>
            <p className="text-xs text-gray-500 font-medium">Hàng chờ: {pendingInvoices.length} bản ghi chưa duyệt</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-1.5 gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Đang kiểm tra AI</span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 shadow-sm active:scale-95"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700">
              {currentIndex + 1} / {pendingInvoices.length}
            </div>
            <button
              disabled={currentIndex >= pendingInvoices.length - 1}
              onClick={() => setCurrentIndex(i => i + 1)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 shadow-sm active:scale-95"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 lg:h-[calc(100vh-240px)]">
        {/* Left: Document View */}
        <div className="flex flex-col gap-4 h-[500px] lg:h-full">
          <div className="flex-1 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-slate-700">
            {currentInvoice.original_file_url ? (
              currentInvoice.original_file_name?.endsWith('.pdf') ? (
                <iframe
                  src={currentInvoice.original_file_url + '#toolbar=0'}
                  className="w-full h-full bg-white"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={currentInvoice.original_file_url}
                    alt="Invoice"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <X size={48} />
                <span className="font-bold">Lỗi tải tài liệu xem trước</span>
              </div>
            )}

            {/* View controls overlay (Simulated) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <button className="text-white/80 hover:text-white p-1 transition-colors"><ChevronLeft size={18} /></button>
              <span className="text-white text-xs font-bold px-2 border-x border-white/10">100%</span>
              <button className="text-white/80 hover:text-white p-1 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                  {currentInvoice.is_demo ? 'Hóa đơn mẫu (Demo)' : (currentInvoice.original_file_name || 'Tài liệu không tên')}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                  Tải lên lúc: {(() => {
                    try {
                      const d = new Date(currentInvoice.created_at);
                      return isNaN(d.getTime()) ? 'Không rõ' : d.toLocaleTimeString();
                    } catch {
                      return 'Không rõ';
                    }
                  })()}
                </p>
              </div>
            </div>
            {currentInvoice.original_file_url && (
              <a
                href={currentInvoice.original_file_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
              >
                Mở file gốc
              </a>
            )}
          </div>
        </div>

        {/* Right: Data Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col min-w-0 h-full overflow-hidden">

          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Chi tiết trích xuất</h3>
                <p className="text-xs text-gray-500 mt-0.5">Vui lòng rà soát các trường thông tin quan trọng</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${currentInvoice.needs_review ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                  {currentInvoice.needs_review ? 'Cần kiểm tra lại' : 'Độ tin cậy cao'}
                </span>
              </div>
            </div>

            {currentInvoice.needs_review && (
              <div className="bg-orange-50 border border-orange-200 p-4 flex items-start gap-4 rounded-2xl">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-orange-800 leading-relaxed font-medium">
                  AI phát hiện một số vùng dữ liệu mờ hoặc khó đọc. Các trường <span className="bg-orange-200 px-1 rounded">tô màu cam/đỏ</span> bên dưới cần được lưu ý đặc biệt.
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
            {/* Group 1: Invoice Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className="w-1.5 h-4 bg-primary-500 rounded-full"></div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Thông tin định danh</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FieldInput
                  label="Số hóa đơn"
                  field={currentInvoice.invoice_number}
                  onChange={(val) => handleUpdateField('invoice_number', val)}
                />
                <FieldInput
                  label="Ngày hóa đơn"
                  field={currentInvoice.invoice_date}
                  onChange={(val) => handleUpdateField('invoice_date', val)}
                />
              </div>
            </section>

            {/* Group 2: Vendor Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Đối tác cung cấp</h4>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <FieldInput
                  label="Tên nhà cung cấp"
                  field={currentInvoice.vendor_name}
                  onChange={(val) => handleUpdateField('vendor_name', val)}
                />
                <FieldInput
                  label="Mã số thuế"
                  field={currentInvoice.vendor_tax_code}
                  onChange={(val) => handleUpdateField('vendor_tax_code', val)}
                />
              </div>
            </section>

            {/* Group 3: Financial Summary */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <div className="w-1.5 h-4 bg-green-500 rounded-full"></div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Số liệu tài chính</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <FieldInput
                  label="Tổng trước thuế"
                  field={currentInvoice.subtotal}
                  type="number"
                  onChange={(val) => handleUpdateField('subtotal', parseFloat(val))}
                />
                <FieldInput
                  label="Thuế suất VAT (%)"
                  field={currentInvoice.vat_rate}
                  type="number"
                  onChange={(val) => handleUpdateField('vat_rate', parseFloat(val))}
                />
                <FieldInput
                  label="Cộng tiền thuế"
                  field={currentInvoice.vat_amount}
                  type="number"
                  onChange={(val) => handleUpdateField('vat_amount', parseFloat(val))}
                />
                <div className="bg-primary-50 rounded-2xl p-0.5 group">
                  <FieldInput
                    label="Tổng tiền thanh toán"
                    field={currentInvoice.total}
                    type="number"
                    isMainAmount
                    onChange={(val) => handleUpdateField('total', parseFloat(val))}
                  />
                </div>
              </div>
            </section>

            {/* Group 4: Line Items */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Chi tiết hàng hóa</h4>
                </div>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {currentInvoice.items?.length || 0} dòng hàng
                </span>
              </div>

              {currentInvoice.items && currentInvoice.items.length > 0 ? (
                <div className="space-y-6">
                  {currentInvoice.items.map((item, index) => (
                    <div key={index} className="relative p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-primary-200 transition-all group/item">
                      <div className="absolute -left-3 top-6 bg-gray-900 text-white text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-xl shadow-lg transform -rotate-12">
                        {index + 1}
                      </div>

                      <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-12">
                          <FieldInput
                            label="Mô tả danh mục hàng hóa / dịch vụ"
                            field={item.description}
                            onChange={(val) => handleUpdateItem(index, 'description', val)}
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <FieldInput
                            label="Số lượng"
                            field={item.quantity}
                            type="number"
                            onChange={(val) => handleUpdateItem(index, 'quantity', parseFloat(val))}
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                          <FieldInput
                            label="Đơn giá"
                            field={item.unit_price}
                            type="number"
                            onChange={(val) => handleUpdateItem(index, 'unit_price', parseFloat(val))}
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-5">
                          <FieldInput
                            label="Thành tiền"
                            field={item.amount}
                            type="number"
                            onChange={(val) => handleUpdateItem(index, 'amount', parseFloat(val))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                  <FileText size={32} className="mb-2 opacity-20" />
                  <p className="text-xs font-medium italic">Không phát hiện chi tiết mặt hàng</p>
                </div>
              )}
            </section>

            <section className="pt-4 pb-12">
              <FieldInput
                label="Ghi chú nghiệp vụ"
                field={currentInvoice.notes || { value: '', confidence: 'high' }}
                onChange={(val) => handleUpdateField('notes', val)}
              />
            </section>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4 z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
            <button
              onClick={() => handleStatusChange('rejected')}
              className="flex flex-1 items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all active:scale-95 group"
            >
              <X size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="uppercase tracking-wide text-xs">Loại bỏ</span>
            </button>
            <button
              onClick={() => handleStatusChange('confirmed')}
              className="flex-[2] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-white bg-gray-900 hover:bg-black transition-all shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 active:scale-95 group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-wide text-sm">Xác nhận & Lưu chứng từ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  label,
  field,
  type = 'text',
  onChange,
  isMainAmount = false
}: {
  label: string,
  field: ExtractedField<any>,
  type?: string,
  onChange: (val: any) => void,
  isMainAmount?: boolean
}) {
  if (!field) field = { value: '', confidence: 'low' };

  let statusStyles = 'border-gray-100 bg-gray-50/80 focus:bg-white focus:border-primary-500 focus:ring-primary-500/10';

  if (field.confidence === 'low') {
    statusStyles = 'border-red-200 bg-red-50/30 text-red-900 focus:border-red-500 focus:ring-red-500/10';
  } else if (field.confidence === 'medium') {
    statusStyles = 'border-orange-200 bg-orange-50/30 text-orange-900 focus:border-orange-500 focus:ring-orange-500/10';
  }

  if (isMainAmount) {
    statusStyles += ' font-black text-lg text-primary-700';
  }

  return (
    <div className="relative space-y-2 group">
      <div className="flex justify-between items-center px-1">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {field.confidence !== 'high' && (
          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${field.confidence === 'low' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
            Check {field.confidence}
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          value={
            field.value !== null &&
              field.value !== undefined &&
              !Number.isNaN(field.value)
              ? field.value
              : ''
          }
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none transition-all duration-300 ${statusStyles}`}
        />
        {field.confidence === 'low' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
        )}
      </div>
    </div>
  )
}

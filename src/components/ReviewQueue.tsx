import React, { useState } from 'react';
import { useAppStore } from '../store';
import { InvoiceData, ExtractedField } from '../types';
import { Check, X, AlertTriangle, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { toast } from './Toast';

export default function ReviewQueue() {
  const { state, dispatch } = useAppStore();
  const pendingInvoices = state.invoices.filter(i => i.status === 'pending_review');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (pendingInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-gray-500 animate-in fade-in zoom-in-95 duration-500 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-primary-50 p-6 rounded-full mb-6 relative">
           <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-50"></div>
           <Check className="w-16 h-16 text-primary-500 relative z-10" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Đã duyệt xong!</h2>
        <p className="text-gray-500 text-base">Không còn hóa đơn nào trong hàng chờ cắt lớp.</p>
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

  const handleStatusChange = (status: 'confirmed' | 'rejected') => {
    dispatch({
      type: 'UPDATE_INVOICE',
      payload: { ...currentInvoice, status }
    });
    
    toast.success(status === 'confirmed' ? "Đã xác nhận hóa đơn" : "Đã loại bỏ hóa đơn");
    
    if (currentIndex > 0 && currentIndex >= pendingInvoices.length - 1) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900">Kiểm tra & Duyệt (OCR)</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium bg-gray-100 px-3 py-1 rounded-full inline-flex mt-2">
            Đang hiển thị {currentIndex + 1} trên tổng số {pendingInvoices.length} bản ghi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(i => i - 1)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            disabled={currentIndex >= pendingInvoices.length - 1}
            onClick={() => setCurrentIndex(i => i + 1)}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 h-[calc(100vh-220px)]">
        {/* Left: Document View */}
        <div className="bg-gray-200/60 rounded-2xl overflow-auto border border-gray-200 shadow-inner p-4 flex justify-center items-start h-full relative group">
          <div className="bg-white p-2 shadow-md relative w-full h-full rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300">
            {currentInvoice.original_file_url ? (
              currentInvoice.original_file_name.endsWith('.pdf') ? (
                <iframe src={currentInvoice.original_file_url + '#toolbar=0'} className="w-full h-full rounded-lg bg-white" />
              ) : (
                <img src={currentInvoice.original_file_url} alt="Invoice" className="w-full h-full object-contain rounded-lg shadow-sm" />
              )
            ) : (
               <div className="text-gray-400 font-medium">Lỗi tải tài liệu xem trước</div>
            )}
          </div>
        </div>

        {/* Right: Data Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto p-7 relative">
          
          {currentInvoice.needs_review && (
            <div className="bg-orange-50 border border-orange-200 p-4 mb-6 flex items-start gap-4 rounded-xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                 <AlertTriangle className="text-orange-500" size={20} />
              </div>
              <p className="text-sm text-orange-800 leading-relaxed font-medium mt-1">
                AI có độ chắn chắn thấp với một số ký tự. Vui lòng kiểm tra lại các vùng tô vàng/đỏ phía dưới.
              </p>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b border-gray-100 pb-3 text-gray-800">1. Thông tin chung</h3>
            <div className="grid grid-cols-2 gap-5">
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
            
            <div className="grid grid-cols-1 gap-5">
              <FieldInput 
                label="Nhà cung cấp" 
                field={currentInvoice.vendor_name} 
                onChange={(val) => handleUpdateField('vendor_name', val)} 
              />
              <FieldInput 
                label="Mã số thuế" 
                field={currentInvoice.vendor_tax_code} 
                onChange={(val) => handleUpdateField('vendor_tax_code', val)} 
              />
            </div>

            <h3 className="text-lg font-semibold border-b border-gray-100 pb-3 mt-10 text-gray-800">2. Số liệu thành tiền</h3>
            <div className="grid grid-cols-2 gap-5">
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
              <div className="relative">
                 <FieldInput 
                   label="Tổng tiền thanh toán" 
                   field={currentInvoice.total} 
                   type="number"
                   onChange={(val) => handleUpdateField('total', parseFloat(val))} 
                 />
              </div>
            </div>

            <h3 className="text-lg font-semibold border-b border-gray-100 pb-3 mt-10 text-gray-800">3. Chi tiết hàng hóa bổ sung</h3>
            {currentInvoice.items && currentInvoice.items.length > 0 ? (
              <div className="space-y-4">
                {currentInvoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl relative hover:border-gray-200 transition-colors">
                    <span className="absolute -left-2 -top-2 bg-gray-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">{index+1}</span>
                    <div className="col-span-12 md:col-span-6">
                       <FieldInput 
                          label="Mô tả danh mục" 
                          field={item.description} 
                          onChange={(val) => handleUpdateItem(index, 'description', val)} 
                        />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                       <FieldInput 
                          label="Số lượng" 
                          field={item.quantity} 
                          type="number"
                          onChange={(val) => handleUpdateItem(index, 'quantity', parseFloat(val))} 
                        />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                       <FieldInput 
                          label="Đơn giá" 
                          field={item.unit_price} 
                          type="number"
                          onChange={(val) => handleUpdateItem(index, 'unit_price', parseFloat(val))} 
                        />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                       <FieldInput 
                          label="Thành tiền" 
                          field={item.amount} 
                          type="number"
                          onChange={(val) => handleUpdateItem(index, 'amount', parseFloat(val))} 
                        />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">Không tìm thấy hoặc không có chi tiết mặt hàng</p>
            )}
            
            <div className="pt-6 pb-24">
               <FieldInput 
                  label="Ghi chú thêm" 
                  field={currentInvoice.notes || { value: '', confidence: 'high' }} 
                  onChange={(val) => handleUpdateField('notes', val)} 
                />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-5 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] flex justify-between gap-4">
             <button 
                onClick={() => handleStatusChange('rejected')}
                className="flex flex-1 items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-red-600 bg-red-50/50 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
             >
                <X size={20} strokeWidth={2.5} /> Từ chối
             </button>
             <button 
                onClick={() => handleStatusChange('confirmed')}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 hover:shadow-lg active:scale-95 border border-primary-500/50"
             >
                <Save size={20} /> Xác nhận & Lưu chứng từ
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldInput({ label, field, type = 'text', onChange }: { label: string, field: ExtractedField<any>, type?: string, onChange: (val: any) => void }) {
  if (!field) field = { value: '', confidence: 'low' };

  let confidenceClass = 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 bg-gray-50 hover:bg-white';
  
  if (field.confidence === 'low') {
    confidenceClass = 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20 hover:bg-red-50 font-medium text-red-900 shadow-sm shadow-red-100/50 mt-1';
  } else if (field.confidence === 'medium') {
    confidenceClass = 'border-orange-300 bg-orange-50/50 focus:border-orange-500 focus:ring-orange-500/20 hover:bg-orange-50 font-medium text-orange-900 shadow-sm shadow-orange-100/50 mt-1';
  }

  return (
    <div className="relative group">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <input 
        type={type}
        value={field.value !== null ? field.value : ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-4 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] ${confidenceClass}`}
      />
      {field.confidence === 'low' && (
         <span className="absolute right-3 top-9 flex w-2 h-2 rounded-full border border-white bg-red-500 animate-pulse"></span>
      )}
    </div>
  )
}

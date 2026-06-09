import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, Loader2, FileUp, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from './Toast';
import { v4 as uuidv4 } from 'uuid';

interface UploadFile extends File {
  preview: string;
  id: string;
}

export default function UploadSection({ onComplete }: { onComplete: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { actions } = useAppStore();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState<any | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [activePreviewDuplicateId, setActivePreviewDuplicateId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: uuidv4()
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic'],
      'application/pdf': ['.pdf']
    },
    maxSize: 4 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        toast.error(`File ${file.file.name} bị từ chối. Vui lòng tải file dung lượng dưới 4MB.`);
      });
    }
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const loadDemoInvoice = async () => {
    const demoId = uuidv4();
    await actions.addInvoice({
      id: demoId,
      original_file_url: 'https://images.unsplash.com/photo-1620800754877-33230a133d1c?auto=format&fit=crop&q=80&w=800',
      original_file_name: 'demo_hoa_don.jpg',
      created_at: Date.now(),
      status: 'pending_review',
      invoice_date: { value: '15/06/2026', confidence: 'high' },
      invoice_number: { value: 'HD-99999', confidence: 'high' },
      vendor_name: { value: 'CÔNG TY TNHH DEMO', confidence: 'high' },
      vendor_tax_code: { value: '0123456789', confidence: 'high' },
      items: [
        {
          description: { value: 'Dịch vụ phần mềm Kế toán', confidence: 'high' },
          quantity: { value: 1, confidence: 'high' },
          unit_price: { value: 1500000, confidence: 'medium' },
          amount: { value: 1500000, confidence: 'high' }
        }
      ],
      vat_rate: { value: 10, confidence: 'high' },
      subtotal: { value: 1500000, confidence: 'high' },
      vat_amount: { value: 150000, confidence: 'high' },
      total: { value: 1650000, confidence: 'high' },
      notes: { value: '', confidence: 'high' },
      needs_review: false,
      is_demo: true,
    });
    toast.success('Đã tải hóa đơn mẫu thành công!');
    onComplete();
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData
        });

        const text = await response.text();
        let data;
        let isJson = false;
        try {
          data = JSON.parse(text);
          isJson = true;
        } catch (e) {
          console.error("Non-JSON API Response:", text.substring(0, 200));
        }

        if (!response.ok) {
          if (isJson && data && data.error) {
            throw new Error(data.error);
          } else {
            throw new Error(`Server API không phản hồi đúng (Mã lỗi ${response.status}). Có thể Express backend chưa chạy.`);
          }
        }

        if (!isJson) {
          throw new Error('Dữ liệu trả về từ máy chủ không hợp lệ (Không phải JSON).');
        }

        await actions.addInvoice({
          ...data,
          id: uuidv4(),
          original_file_url: data.original_file_url || file.preview,
          original_file_name: file.name,
          created_at: Date.now(),
          status: 'pending_review'
        });

        successCount++;
      } catch (error: any) {
        toast.error(`Lỗi khi xử lý file ${file.name}: ${error.message}`);
      }
    }

    setIsProcessing(false);
    setFiles([]);

    if (successCount > 0) {
      toast.success(`Đã đọc thành công ${successCount} hóa đơn`);
      onComplete();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4 mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
            <FileUp className="text-primary-500" strokeWidth={2.5} size={22} />
            Tải lên hóa đơn
          </h2>
          <p className="text-sm text-gray-500 mt-1">Hỗ trợ nhận diện thông minh đa định dạng (PDF, JPG, PNG)</p>
        </div>
        <button onClick={loadDemoInvoice} className="flex items-center justify-center gap-2 px-5 py-2.5 border border-primary-200 text-primary-700 bg-primary-50 rounded-xl text-sm font-semibold hover:bg-primary-100 hover:border-primary-300 transition-all shadow-sm">
          <Sparkles size={16} className="text-primary-500" />
          Chạy Hóa Đơn Mẫu
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-8 md:p-16 text-center transition-all cursor-pointer group shadow-sm
          ${isDragActive ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10' : 'border-gray-200 hover:border-primary-400 bg-white hover:shadow-md'}`}
      >
        <input {...getInputProps()} capture="environment" />
        <div className="mx-auto flex justify-center mb-5 text-primary-500 bg-primary-50 w-20 h-20 rounded-2xl items-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary-100">
          <UploadCloud size={36} strokeWidth={2} />
        </div>
        <p className="text-lg md:text-xl font-display font-semibold text-gray-800 mb-2">
          Kéo thả hoặc click để chọn file
        </p>
        <p className="text-sm md:text-base text-gray-500 px-4 md:px-0">
          Hỗ trợ ảnh chụp điện thoại rõ nét, hóa đơn PDF (Tối đa 4MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800 text-lg">Đã chọn {files.length} file chờ xử lý</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-8">
            {files.map((file) => (
              <div key={file.id} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square shadow-sm hover:shadow-md transition-shadow">
                {file.type.includes('image') ? (
                  <img src={file.preview} alt={file.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border border-gray-100">
                    <div className="bg-white p-3 rounded-xl shadow-sm mb-2 text-primary-500">
                      <File size={32} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 text-center px-4 w-full truncate border border-transparent">PDF</span>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="absolute top-2 right-2 bg-white text-gray-700 rounded-full p-1.5 shadow-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-red-50 hover:text-red-500"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-3 py-2 text-xs font-medium truncate border-t border-gray-100/50">
                  {file.name}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>AI Đang Xử lý ({progress.current}/{progress.total})</span>
                </>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={18} /> Bắt đầu trích xuất AI</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* DUPLICATE WARNING MODAL */}
      {showDuplicateModal && pendingInvoice && (
        <div id="duplicate-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">

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
                  Hệ thống tìm thấy hóa đơn có thông tin tương tự trên Supabase.
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
                    <strong className="text-gray-955 font-semibold text-sm">{pendingInvoice.invoice_number?.value || '(Trống)'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Tổng tiền thanh toán</span>
                    <strong className="text-emerald-700 font-bold text-sm">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingInvoice.total?.value || 0)}
                    </strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Nhà cung cấp</span>
                    <strong className="text-gray-955 font-semibold">{pendingInvoice.vendor_name?.value || '(Trống)'}</strong>
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

                    const isExpanded = activePreviewDuplicateId === dup.id;

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
                              onClick={() => setActivePreviewDuplicateId(isExpanded ? null : dup.id)}
                              className="px-2.5 py-1 text-xs border border-gray-300 hover:border-[#1B52CC] hover:text-[#1B52CC] rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-1"
                            >
                              <Eye size={12} />
                              <span>{isExpanded ? 'Ẩn' : 'Xem'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Collapsible expanded detail */}
                        {isExpanded && (
                          <div className="bg-[#F8F9FC] border-t border-gray-200 p-3.5 text-xs grid grid-cols-2 gap-2 animate-fade-in select-text">
                            <div>
                              <span className="text-gray-400 block">Ngày tạo lập</span>
                              <span className="font-semibold text-gray-900">{formatDuplicateDate(dup.created_at)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block">Số tiền lập</span>
                              <span className="font-bold text-emerald-700">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(dupTotal))}
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
                onClick={() => {
                  // "Bỏ qua, không thêm" -> Đóng modal, clear pending
                  setShowDuplicateModal(false);
                  setPendingInvoice(null);
                  setDuplicates([]);
                  setActivePreviewDuplicateId(null);
                  if (duplicateTrackId) {
                    setTracks((prev) =>
                      prev.map((t) => (t.id === duplicateTrackId ? { ...t, status: 'error', error: 'Bị hủy do trùng lặp' } : t))
                    );
                  }
                  toast.success("Đã hủy bỏ tải lên hóa đơn trùng lặp.");
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-[#475569] hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer leading-none"
                style={{ height: '38px' }}
              >
                Bỏ qua, không thêm
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (pendingInvoice) {
                    try {
                      // “Vẫn thêm mới” -> Thêm vào global database/store
                      await actions.addInvoice(pendingInvoice);

                      // Gọi logAudit (BƯỚC 4)
                      await logAudit(
                        pendingInvoice.id,
                        'added_despite_duplicate',
                        null,
                        { duplicateOf: duplicates.map(d => d.id) }
                      );

                      toast.success("Đã lưu hóa đơn thành công mặc dù phát hiện trùng lặp.");
                    } catch (e: any) {
                      toast.error("Không thể lưu hóa đơn: " + e.message);
                    }
                  }
                  setShowDuplicateModal(false);
                  setPendingInvoice(null);
                  setDuplicates([]);
                  setActivePreviewDuplicateId(null);
                }}
                className="px-4 py-2 border border-red-500 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer leading-none hover:shadow-sm"
                style={{ height: '38px' }}
              >
                Vẫn thêm mới
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

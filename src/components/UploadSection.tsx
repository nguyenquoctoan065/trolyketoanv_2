import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, Loader2, FileUp, Sparkles } from 'lucide-react';
import { useAppStore } from '../store';
import { toast } from './Toast';
import { v4 as uuidv4 } from 'uuid';
import { checkDuplicates } from '../lib/utils';
import DuplicateWarningModal from './DuplicateWarningModal';
import { saveOfflineInvoice } from '../lib/offlineDb';

interface UploadFile extends File {
  preview: string;
  id: string;
}

interface ProcessingTrack {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'duplicate';
  error?: string;
}

const logAudit = async (invoiceId: string, action: string, userId: string | null, details: any) => {
  console.log('Audit Log:', { invoiceId, action, userId, details });
};

export default function UploadSection({ onComplete }: { onComplete: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { state, actions } = useAppStore();
  
  const [tracks, setTracks] = useState<ProcessingTrack[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingInvoice, setPendingInvoice] = useState<any | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [resolveDuplicate, setResolveDuplicate] = useState<((value: boolean) => void) | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: uuidv4()
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

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
    const demoData = {
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
      status: 'confirmed',
    };

    const added = await handleDuplicateFlow(
      demoData,
      'demo_hoa_don.jpg',
      'https://images.unsplash.com/photo-1620800754877-33230a133d1c?auto=format&fit=crop&q=80&w=800',
      demoId
    );

    if (added) {
      toast.success('Đã tải hóa đơn mẫu thành công!');
      onComplete();
    }
  };

  const handleDuplicateFlow = async (data: any, fileName: string, fileUrl: string, fileId: string): Promise<boolean> => {
    const foundDuplicates = checkDuplicates(data, state.invoices);
    
    if (foundDuplicates.length > 0) {
      setPendingInvoice({
        ...data,
        original_file_name: fileName,
        original_file_url: fileUrl,
        id: uuidv4(),
        created_at: Date.now()
      });
      setDuplicates(foundDuplicates);
      setShowDuplicateModal(true);
      
      return new Promise((resolve) => {
        setResolveDuplicate(() => resolve);
      });
    }

    // No duplicates, add directly
    await actions.addInvoice({
      ...data,
      id: uuidv4(),
      original_file_url: fileUrl,
      original_file_name: fileName,
      created_at: Date.now(),
      status: data.status || 'pending_review'
    });
    return true;
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    if (!navigator.onLine) {
      for (const file of files) {
        await saveOfflineInvoice(file, file.name);
      }
      toast.info(`Đã lưu ${files.length} hóa đơn offline. Sẽ tự động đồng bộ khi có mạng.`);
      setFiles([]);
      onComplete();
      return;
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });
    setTracks(files.map(f => ({ id: f.id, fileName: f.name, status: 'pending' })));

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });
      setTracks(prev => prev.map(t => t.id === file.id ? { ...t, status: 'processing' } : t));

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
            throw new Error(`Server API không phản hồi đúng (Mã lỗi ${response.status}).`);
          }
        }

        if (!isJson) {
          throw new Error('Dữ liệu trả về từ máy chủ không hợp lệ (Không phải JSON).');
        }

        const added = await handleDuplicateFlow(data, file.name, data.original_file_url || file.preview, file.id);
        
        if (added) {
          setTracks(prev => prev.map(t => t.id === file.id ? { ...t, status: 'success' } : t));
          successCount++;
        } else {
          setTracks(prev => prev.map(t => t.id === file.id ? { ...t, status: 'duplicate' } : t));
        }
      } catch (error: any) {
        setTracks(prev => prev.map(t => t.id === file.id ? { ...t, status: 'error', error: error.message } : t));
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
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-primary-50 rounded-2xl text-primary-600 shadow-inner">
             <FileUp size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
              Tải lên hóa đơn
            </h2>
            <p className="text-gray-500 mt-1 max-w-md leading-relaxed">
              Trợ lý AI sẽ tự động đọc, phân tích và trích xuất dữ liệu từ các định dạng <span className="font-semibold text-gray-700">PDF, JPG, PNG</span>.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={loadDemoInvoice}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-bold text-sm transition-all shadow-sm"
          >
            <Sparkles size={18} className="text-primary-500" /> Tạo hóa đơn mẫu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-[2.5rem] p-12 md:p-20 text-center transition-all cursor-pointer group bg-white overflow-hidden
              ${isDragActive ? 'border-primary-500 bg-primary-50/30 ring-8 ring-primary-500/5' : 'border-gray-200 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/5'}`}
          >
            <input {...getInputProps()} capture="environment" />
            
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="mx-auto flex justify-center mb-6 text-primary-500 bg-white w-24 h-24 rounded-[2rem] items-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary-500/10 border border-primary-50">
                <UploadCloud size={44} strokeWidth={1.5} />
              </div>
              <p className="text-xl md:text-2xl font-display font-bold text-gray-900 mb-3">
                Thả hóa đơn vào đây
              </p>
              <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                Click để chọn hoặc kéo thả nhiều file cùng lúc (Tối đa 4MB/file)
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 animate-in zoom-in-95 fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                   <h3 className="font-bold text-gray-900 text-xl tracking-tight">Danh sách chờ xử lý ({files.length})</h3>
                </div>
                {!isProcessing && (
                  <button 
                    onClick={() => setFiles([])}
                    className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                  >
                    <X size={16} strokeWidth={2.5} /> Xóa tất cả
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
                {files.map((file) => (
                  <div key={file.id} className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/5] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                    {file.type.includes('image') ? (
                      <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                        <div className="bg-white p-4 rounded-2xl shadow-sm mb-3 text-primary-500 border border-primary-50">
                          <File size={36} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Tài liệu PDF</span>
                      </div>
                    )}

                    {!isProcessing && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </button>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <p className="text-white text-xs font-bold truncate leading-tight">{file.name}</p>
                      <p className="text-white/60 text-[10px] mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center border-t border-gray-100 pt-8">
                <button
                  onClick={processFiles}
                  disabled={isProcessing}
                  className="group relative w-full sm:w-auto px-12 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-2xl shadow-gray-900/20 active:scale-95 overflow-hidden"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span className="tracking-wide">ĐANG TRÍCH XUẤT ({progress.current}/{progress.total})</span>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Sparkles size={20} className="relative z-10" />
                      <span className="relative z-10 tracking-wide uppercase">Bắt đầu xử lý bằng AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Progress (Visible during processing) */}
        <div className="space-y-6">
          {isProcessing && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-in slide-in-from-right-4 duration-500">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Loader2 size={18} className="animate-spin text-primary-500" />
                 Tiến độ xử lý
               </h3>
               <div className="space-y-4">
                  {tracks.slice(-4).map((track, i) => (
                    <div key={track.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${track.status === 'processing' ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-100'}`}>
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                         ${track.status === 'success' ? 'bg-green-100 text-green-600' : 
                           track.status === 'error' ? 'bg-red-100 text-red-600' : 
                           track.status === 'processing' ? 'bg-primary-500 text-white animate-pulse' : 'bg-white text-gray-400'}`}>
                          {track.status === 'success' ? <CheckIcon size={16} strokeWidth={3} /> : 
                           track.status === 'error' ? <X size={16} strokeWidth={3} /> : 
                           track.status === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <span>{i+1}</span>}
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">{track.fileName}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {track.status === 'pending' && 'Đang chờ...'}
                            {track.status === 'processing' && 'AI đang đọc dữ liệu...'}
                            {track.status === 'success' && 'Thành công'}
                            {track.status === 'error' && `Lỗi: ${track.error}`}
                            {track.status === 'duplicate' && 'Phát hiện trùng lặp'}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {!isProcessing && (
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-primary-100 text-sm leading-relaxed mb-6 opacity-90">
                  Tải lên hóa đơn đầu tiên để trải nghiệm sức mạnh của trợ lý AI. Hệ thống tự động phân tích và lưu trữ vào kho dữ liệu.
                </p>
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                      Mô hình AI đang hoạt động
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
                      Độ chính xác cao ~98%
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DUPLICATE WARNING MODAL */}
      {showDuplicateModal && pendingInvoice && (
        <DuplicateWarningModal
          pendingInvoice={pendingInvoice}
          duplicates={duplicates}
          onResolve={async (shouldAdd) => {
            if (shouldAdd) {
              if (pendingInvoice) {
                await actions.addInvoice({
                  ...pendingInvoice,
                  status: 'confirmed'
                });
                await logAudit(
                  pendingInvoice.id,
                  'added_despite_duplicate',
                  null,
                  { duplicateOf: duplicates.map((d: any) => d.id) }
                );
              }
              toast.success("Đã lưu hóa đơn thành công mặc dù phát hiện trùng lặp.");
            } else {
              toast.success("Đã hủy bỏ tải lên hóa đơn trùng lặp.");
            }

            if (resolveDuplicate) resolveDuplicate(shouldAdd);
            setShowDuplicateModal(false);
            setPendingInvoice(null);
            setDuplicates([]);
          }}
        />
      )}
    </div>
  );
}

function CheckIcon({ size = 24, strokeWidth = 2, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

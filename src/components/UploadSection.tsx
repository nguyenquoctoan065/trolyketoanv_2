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
  const { dispatch } = useAppStore();

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

  const loadDemoInvoice = () => {
    const demoId = uuidv4();
    dispatch({
      type: 'ADD_INVOICE',
      payload: {
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
      }
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
        
        dispatch({
          type: 'ADD_INVOICE',
          payload: {
            ...data,
            id: uuidv4(),
            original_file_url: file.preview,
            original_file_name: file.name,
            created_at: Date.now(),
            status: 'pending_review'
          }
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
        className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer group shadow-sm
          ${isDragActive ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10' : 'border-gray-200 hover:border-primary-400 bg-white hover:shadow-md'}`}
      >
        <input {...getInputProps()} capture="environment" />
        <div className="mx-auto flex justify-center mb-5 text-primary-500 bg-primary-50 w-20 h-20 rounded-2xl items-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary-100">
          <UploadCloud size={36} strokeWidth={2} />
        </div>
        <p className="text-xl font-display font-semibold text-gray-800 mb-2">
          Kéo thả hoặc click để chọn file
        </p>
        <p className="text-base text-gray-500">
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

          <div className="flex justify-end border-t border-gray-100 pt-5">
            <button
              onClick={processFiles}
              disabled={isProcessing}
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-500/20 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>AI Đang Xử lý ({progress.current}/{progress.total})</span>
                </>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={18}/> Bắt đầu trích xuất AI</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

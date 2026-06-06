"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppStore } from '../store';
import { Upload, FileText, CheckCircle, BarChart3, ChevronRight, X, HelpCircle, UserX, Menu, LogOut, Loader2 } from 'lucide-react';
import UploadSection from '../components/UploadSection';
import ReviewQueue from '../components/ReviewQueue';
import InvoiceTable from '../components/InvoiceTable';
import DashboardStats from '../components/DashboardStats';
import HelpFAQ from '../components/HelpFAQ';
import AuthScreen from '../components/AuthScreen';
import { ToastContainer, toast } from '../components/Toast';

function WelcomeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { actions } = useAppStore();

  const handleUseDemo = () => {
     actions.addInvoice({
        id: crypto.randomUUID(),
        status: 'confirmed',
        created_at: Date.now(),
        needs_review: false,
        is_demo: true,
        invoice_date: { value: '15/05/2026', confidence: 'high' },
        invoice_number: { value: 'HD-19028', confidence: 'high' },
        vendor_name: { value: 'Công Ty Điện Lực Hà Nội', confidence: 'high' },
        vendor_tax_code: { value: '0100123456', confidence: 'high' },
        items: [{ description: { value: 'Tiền điện văn phòng T5', confidence: 'high' }, quantity: { value: 1, confidence: 'high' }, unit_price: { value: 1500000, confidence: 'high' }, amount: { value: 1500000, confidence: 'high' } }],
        subtotal: { value: 1500000, confidence: 'high' },
        vat_rate: { value: 10, confidence: 'high' },
        vat_amount: { value: 150000, confidence: 'high' },
        total: { value: 1650000, confidence: 'high' },
     });
     actions.addInvoice({
        id: crypto.randomUUID(),
        status: 'confirmed',
        created_at: Date.now() - 86400000 * 2,
        needs_review: false,
        is_demo: true,
        invoice_date: { value: '13/05/2026', confidence: 'high' },
        invoice_number: { value: 'HD-88321', confidence: 'high' },
        vendor_name: { value: 'CP Vật Tư Office', confidence: 'high' },
        vendor_tax_code: { value: '0310987654', confidence: 'high' },
        items: [{ description: { value: 'Giấy in A4, bút, file càng cua', confidence: 'high' }, quantity: { value: 1, confidence: 'high' }, unit_price: { value: 2000000, confidence: 'high' }, amount: { value: 2000000, confidence: 'high' } }],
        subtotal: { value: 2000000, confidence: 'high' },
        vat_rate: { value: 10, confidence: 'high' },
        vat_amount: { value: 200000, confidence: 'high' },
        total: { value: 2200000, confidence: 'high' },
     });
     toast.success('Đã tải dữ liệu mẫu thành công!');
     onClose();
  };

  const steps = [
    {
       title: 'Chào mừng đến AccoBot',
       desc: 'Tự động trích xuất thông tin hóa đơn (ảnh/PDF) chỉ trong vài giây. Lưu trữ và xuất Excel dễ dàng.',
       icon: <Upload className="w-14 h-14 text-primary-500 mb-6 drop-shadow-sm" strokeWidth={1.5} />
    },
    {
       title: 'Cực kỳ chính xác',
       desc: 'Nhận diện tự động 12 trường thông tin với AI hàng đầu. Đánh dấu màu đối với các trường thông tin không chắc chắn.',
       icon: <CheckCircle className="w-14 h-14 text-primary-500 mb-6 drop-shadow-sm" strokeWidth={1.5} />
    },
    {
       title: 'Sẵn sàng báo cáo',
       desc: 'Tương quan chi phí theo thời gian biểu, cảnh báo ngân sách hoạt động và xuất báo cáo PDF.',
       icon: <BarChart3 className="w-14 h-14 text-primary-500 mb-6 drop-shadow-sm" strokeWidth={1.5} />
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative border border-white/20 animate-in slide-in-from-bottom-4 duration-500">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2 transition-colors">
          <X size={20} />
        </button>
        <div className="p-10 pb-6 flex flex-col items-center text-center">
            {steps[step].icon}
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">{steps[step].title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{steps[step].desc}</p>
        </div>
        <div className="px-8 flex items-center justify-center gap-2.5 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary-500 shadow-sm shadow-primary-500/30' : 'w-2 bg-gray-200'}`} />
            ))}
        </div>
        <div className="p-6 bg-gray-50/50 flex flex-col gap-3">
           {step < steps.length - 1 ? (
             <button
               onClick={() => setStep(s => s + 1)}
               className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3.5 font-semibold hover:bg-gray-800 transition-colors shadow-sm"
             >
               Tiếp tục <ChevronRight size={18} />
             </button>
           ) : (
             <button
               onClick={onClose}
               className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white rounded-xl py-3.5 font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/20"
             >
               Bắt đầu ngay <CheckCircle size={18} />
             </button>
           )}
           {step === 0 && (
              <button 
                onClick={handleUseDemo}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3.5 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Dùng dữ liệu mẫu (Demo)
              </button>
           )}
        </div>
      </div>
    </div>
  );
}

function TopHeader({ activeTab, onMenuClick }: { activeTab: string, onMenuClick: () => void }) {
  const titles: Record<string, string> = {
    'upload': 'Tải lên hóa đơn',
    'review': 'Kiểm tra & Duyệt (OCR)',
    'table': 'Kho lưu trữ Hóa đơn',
    'dashboard': 'Tổng quan & Báo cáo',
    'help': 'Hỗ trợ & Hướng dẫn'
  };

  return (
    <header className="flex items-center justify-between py-4 px-4 md:px-8 bg-white/60 backdrop-blur-xl border-b border-gray-100 z-10 sticky top-0">
      <div className="flex items-center gap-3">
         <button onClick={onMenuClick} className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden">
           <Menu size={24} />
         </button>
         <h2 className="text-xl md:text-2xl font-display font-semibold text-gray-800">{titles[activeTab] || 'AccoBot'}</h2>
      </div>
    </header>
  )
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'table' | 'dashboard' | 'help'>('upload');
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state, actions } = useAppStore();

  const pendingCount = state.invoices.filter(i => i.status === 'pending_review').length;

  useEffect(() => {
    if (state.user) {
      const isFirstVisit = !localStorage.getItem('accobot_onboarding_completed');
      if (isFirstVisit) {
         setShowWelcome(true);
      }
    }
  }, [state.user]);

  const handleCloseWelcome = () => {
     localStorage.setItem('accobot_onboarding_completed', 'true');
     setShowWelcome(false);
  };

  const handleTabChange = (tab: 'upload' | 'review' | 'table' | 'dashboard' | 'help') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // 1. Session check: loading spinner
  if (state.authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative font-sans">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-[0.02] pointer-events-none" />
        <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium text-sm">Đang tải phiên làm việc...</p>
      </div>
    );
  }

  // 2. Session check: show login screen if not logged in
  if (!state.user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans">
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 flex-shrink-0 flex flex-col text-gray-300 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
               <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
               <h1 className="text-2xl font-display font-bold text-white tracking-tight">AccoBot</h1>
               <p className="text-xs text-primary-300/80 font-medium tracking-wide">TRỢ LÝ KẾ TOÁN AI</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-1.5 px-4 pb-6 overflow-y-auto flex-1 mt-6">
          <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2 mt-4 uppercase">Chức năng chính</p>
          <NavItem 
            icon={<Upload size={18} />} label="Tải lên hóa đơn" 
            isActive={activeTab === 'upload'} onClick={() => handleTabChange('upload')} 
          />
          <NavItem 
            icon={<FileText size={18} />} label="Hóa đơn chờ duyệt" 
            badgeCount={pendingCount}
            isActive={activeTab === 'review'} onClick={() => handleTabChange('review')} 
          />
          <NavItem 
            icon={<CheckCircle size={18} />} label="Kho lưu trữ HĐ" 
            isActive={activeTab === 'table'} onClick={() => handleTabChange('table')} 
          />
          
          <p className="px-4 text-xs font-semibold text-gray-500 tracking-wider mb-2 mt-6 uppercase">Báo cáo & Phân tích</p>
          <NavItem 
            icon={<BarChart3 size={18} />} label="Tổng quan Budget" 
            isActive={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} 
          />

          <div className="mt-auto pt-6 flex flex-col gap-2 border-t border-gray-800">
            {/* User Profile Card */}
            <div className="px-4 py-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-400 font-bold flex items-center justify-center text-sm uppercase">
                {state.user?.email?.charAt(0) || 'U'}
              </div>
              <div className="truncate flex-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tài khoản</p>
                <p className="text-xs text-gray-300 font-medium truncate" title={state.user?.email}>{state.user?.email}</p>
              </div>
            </div>

            <NavItem 
              icon={<HelpCircle size={18} />} label="Hỗ trợ & FAQ" 
              isActive={activeTab === 'help'} onClick={() => handleTabChange('help')} 
            />

            <button
               onClick={() => {
                 if (confirm('Bạn có chắc chắn muốn xóa toàn bộ hóa đơn mẫu?')) {
                   actions.clearDemoInvoices();
                   toast.success('Đã xóa dữ liệu mẫu');
                 }
               }}
               className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all group text-red-400 hover:bg-white/5 hover:text-red-300 w-full text-left"
            >
               <span className="group-hover:text-red-300"><UserX size={16} /></span>
               Xóa dữ liệu mẫu
            </button>

            <button
               onClick={() => actions.signOut()}
               className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group text-red-400 hover:bg-red-950/30 hover:text-red-300 w-full text-left border border-red-500/10 mt-1"
            >
               <span className="group-hover:text-red-300"><LogOut size={18} /></span>
               Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa] relative w-full">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-[0.02] pointer-events-none" />
         <TopHeader activeTab={activeTab} onMenuClick={() => setIsMobileMenuOpen(true)} />
         
         <div className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
           <div className="max-w-[1400px] mx-auto w-full relative z-10 transition-all duration-300">
             {activeTab === 'upload' && <UploadSection onComplete={() => handleTabChange('review')} />}
             {activeTab === 'review' && <ReviewQueue />}
             {activeTab === 'table' && <InvoiceTable />}
             {activeTab === 'dashboard' && <DashboardStats />}
             {activeTab === 'help' && <HelpFAQ />}
           </div>
         </div>
      </main>

      <ToastContainer />
    </div>
  );
}

function NavItem({ icon, label, badgeCount, isActive, onClick }: { icon: React.ReactNode, label: string, badgeCount?: number, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
        isActive 
          ? 'bg-primary-600/10 text-primary-400' 
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
         <span className={`${isActive ? 'text-primary-500' : 'group-hover:text-gray-300'}`}>{icon}</span>
         {label}
      </div>
      {badgeCount !== undefined && badgeCount > 0 && (
         <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isActive ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30' : 'bg-gray-800 text-gray-300'}`}>
            {badgeCount}
         </span>
      )}
    </button>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

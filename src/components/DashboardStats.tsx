import React, { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, isThisMonth, isToday } from 'date-fns';
import { FileText, DollarSign, CheckCircle, Clock, Settings, X, Calendar, AlertCircle } from 'lucide-react';
import { toast } from './Toast';

export default function DashboardStats() {
  const { state } = useAppStore();
  const [budget, setBudget] = useState<number>(0);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    const savedBudget = localStorage.getItem('invoice_app_budget');
    if (savedBudget) {
      setBudget(Number(savedBudget));
    }
  }, []);

  const handleSaveBudget = () => {
    const val = Number(budgetInput);
    if (val >= 0) {
      setBudget(val);
      localStorage.setItem('invoice_app_budget', val.toString());
      toast.success('Đã lưu thiết lập ngân sách tháng');
      setIsBudgetModalOpen(false);
    } else {
      toast.error('Ngân sách không hợp lệ!');
    }
  };
  
  const stats = useMemo(() => {
    let invoicesToday = 0;
    let invoicesMonth = 0;
    let totalCostMonth = 0;
    let totalVatMonth = 0;
    let pendingCount = 0;

    const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        dateStr: format(d, 'MM/dd'), 
        dateFull: format(d, 'yyyy-MM-dd'),
        count: 0,
        amount: 0 
      };
    });

    const last6MonthsData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        monthStr: format(d, 'MM/yyyy'),
        monthKey: format(d, 'yyyy-MM'),
        spent: 0,
        budget: budget // Using current budget as target for historical view for simplicity
      };
    });

    state.invoices.forEach(inv => {
      const d = new Date(inv.created_at);
      
      if (isToday(d)) invoicesToday++;
      if (isThisMonth(d) && inv.status !== 'rejected') {
        invoicesMonth++;
        totalCostMonth += Number(inv.subtotal?.value || 0);
        totalVatMonth += Number(inv.vat_amount?.value || 0);
      }
      
      if (inv.status === 'pending_review') {
        pendingCount++;
      }

      if (inv.status === 'confirmed') {
        const fullStr = format(d, 'yyyy-MM-dd');
        const dayStat = last7DaysData.find(x => x.dateFull === fullStr);
        if (dayStat) {
           dayStat.count++;
           dayStat.amount += Number(inv.total?.value || 0);
        }

        const monthKey = format(d, 'yyyy-MM');
        const monthStat = last6MonthsData.find(x => x.monthKey === monthKey);
        if (monthStat) {
           monthStat.spent += Number(inv.total?.value || 0);
        }
      }
    });

    return {
      invoicesToday,
      invoicesMonth,
      totalCostMonth,
      totalVatMonth,
      totalMonthIncludeVat: totalCostMonth + totalVatMonth,
      pendingCount,
      last7DaysData,
      last6MonthsData
    };
  }, [state.invoices, budget]);

  const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const statusData = [
    { name: 'Chờ duyệt (OCR)', value: state.invoices.filter(i => i.status === 'pending_review').length },
    { name: 'Đã hoàn tất', value: state.invoices.filter(i => i.status === 'confirmed').length },
    { name: 'Loại bỏ', value: state.invoices.filter(i => i.status === 'rejected').length },
  ];
  const COLORS = ['#F59E0B', '#1D9E75', '#EF4444'];
  
  const budgetPercentage = budget > 0 ? Math.min(100, Math.round((stats.totalMonthIncludeVat / budget) * 100)) : 0;
  const isOverBudget = budget > 0 && stats.totalMonthIncludeVat >= budget;
  const isNearBudget = budget > 0 && stats.totalMonthIncludeVat >= budget * 0.8 && !isOverBudget;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
           <h2 className="text-xl font-display font-bold text-gray-900">Tổng quan & Báo cáo</h2>
           <p className="text-sm text-gray-500 mt-1">Nắm bắt nhanh tình hình ngân sách và hóa đơn chờ duyệt</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           {/* Budget Progress (if budget > 0) */}
           {budget > 0 ? (
             <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex-1 md:flex-auto">
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Ngân sách tháng</p>
                  <p className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : isNearBudget ? 'text-orange-500' : 'text-gray-900'}`}>
                    {formatMoney(stats.totalMonthIncludeVat)} <span className="text-gray-400 font-medium">/ {formatMoney(budget)}</span>
                  </p>
                </div>
                <div className="w-24 md:w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                   <div 
                     className={`h-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-orange-500' : 'bg-primary-500'}`} 
                     style={{ width: `${budgetPercentage}%` }}
                   ></div>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-3 bg-orange-50/50 px-4 py-2 rounded-xl border border-orange-100/50 flex-1 md:flex-auto">
                <AlertCircle className="text-orange-400" size={18} />
                <span className="text-sm text-orange-700 font-medium">Bạn chưa cấu hình ngưỡng ngân sách.</span>
             </div>
           )}
           <button 
             onClick={() => { setBudgetInput(budget.toString()); setIsBudgetModalOpen(true); }}
             className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-primary-600 transition-all shadow-sm bg-white"
             title="Thiết lập ngân sách"
           >
             <Settings size={20} />
           </button>
        </div>
      </div>
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          icon={<FileText className="w-6 h-6" />} iconBg="text-blue-500 bg-blue-50" 
          label="Đã thu thập hôm nay" value={stats.invoicesToday.toString()} 
        />
        <StatCard 
          icon={<Clock className="w-6 h-6" />} iconBg="text-orange-500 bg-orange-50" 
          label="Chờ duyệt (OCR)" value={stats.pendingCount.toString()} 
        />
        <StatCard 
          icon={<DollarSign className="w-6 h-6" />} iconBg="text-primary-500 bg-primary-50" 
          label="Trước thuế (Tháng này)" value={`${formatMoney(stats.totalCostMonth)}`} 
        />
        <StatCard 
          icon={<CheckCircle className="w-6 h-6" />} iconBg="text-purple-500 bg-purple-50" 
          label="VAT (Tháng này)" value={`${formatMoney(stats.totalVatMonth)}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart 6 months */}
        <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-gray-800">Lịch sử chi phí & Ngân sách (6 tháng)</h3>
             <Calendar className="text-gray-400" size={20} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.last6MonthsData} margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthStr" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val} 
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${formatMoney(value)} VNĐ`, name === 'spent' ? 'Thực chi' : 'Ngân sách']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="spent" name="Thực chi" stroke="#1D9E75" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="budget" name="Ngân sách" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 self-start mb-6 w-full">Trạng thái xử lý hệ thống</h3>
          <div className="h-48 w-full relative">
            {state.invoices.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-full">
                  Chưa có dữ liệu
               </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
              </PieChart>
            </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-8 w-full px-4">
            {statusData.map((entry, index) => (
               <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-gray-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{entry.value}</span>
               </div>
            ))}
          </div>
        </div>
      </div>

      {stats.pendingCount > 0 && (
         <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Danh sách ưu tiên: Cần duyệt sớm ({stats.pendingCount})</h3>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">YÊU CẦU ACTION</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
               <table className="w-full text-left border-collapse text-sm min-w-max">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                     <tr>
                        <th className="py-3 px-5 text-gray-500 font-semibold uppercase tracking-wider text-xs">Ngày HĐ</th>
                        <th className="py-3 px-5 text-gray-500 font-semibold uppercase tracking-wider text-xs">Số HĐ</th>
                        <th className="py-3 px-5 text-gray-500 font-semibold uppercase tracking-wider text-xs">Nhà cung cấp</th>
                        <th className="py-3 px-5 text-gray-500 font-semibold uppercase tracking-wider text-xs text-right">Tổng tiền</th>
                        <th className="py-3 px-5 text-gray-500 font-semibold uppercase tracking-wider text-xs text-center">Độ tự tin (AI)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {state.invoices.filter(i => i.status === 'pending_review').slice(0, 5).map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                           <td className="py-3 px-5 text-gray-600 font-medium">{String(inv.invoice_date?.value || '-')}</td>
                           <td className="py-3 px-5 text-gray-900 font-semibold">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{String(inv.invoice_number?.value || '-')}</span>
                           </td>
                           <td className="py-3 px-5 text-gray-700">{String(inv.vendor_name?.value || '-')}</td>
                           <td className="py-3 px-5 text-gray-900 text-right font-bold">{formatMoney(inv.total?.value || 0)}</td>
                           <td className="py-3 px-5 text-center">
                              {inv.needs_review ? (
                                 <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                                    <AlertCircle size={12} className="mr-1" /> Cần KT lại
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                    Đã sẵn sàng
                                 </span>
                               )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-display font-bold text-lg text-gray-900">Thiết lập ngân sách</h3>
               <button onClick={() => setIsBudgetModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm p-1.5 rounded-full border border-gray-200">
                 <X size={18} strokeWidth={2.5}/>
               </button>
            </div>
            <div className="p-7">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ngân sách cho phép (VNĐ/Tháng)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pr-12 outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all text-lg font-bold text-gray-800"
                  placeholder="Ví dụ: 50.000.000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">VNĐ</span>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
                 <AlertCircle size={14} className="shrink-0 text-gray-400" />
                 Nhập 0 để vô hiệu hóa tính năng cảnh báo thông minh.
              </p>
            </div>
            <div className="px-6 py-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
               <button onClick={() => setIsBudgetModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 text-gray-700 transition-colors">Đóng lại</button>
               <button onClick={handleSaveBudget} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all active:scale-95">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ icon, iconBg, label, value }: { icon: React.ReactNode, iconBg: string, label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-semibold text-gray-500 tracking-wide">{label}</p>
        <div className={`${iconBg} rounded-xl p-2.5 flex-shrink-0 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}


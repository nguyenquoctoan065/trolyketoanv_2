import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, MessageSquare } from 'lucide-react';

const FAQS = [
  {
    q: "Làm sao để upload nhiều hóa đơn cùng lúc?",
    a: "Tại tab 'Tải lên hóa đơn', bạn có thể kéo thả toàn bộ thư mục chứa file ảnh/PDF hoặc click để chọn nhiều file. Bạn cũng có thể kéo thả hóa đơn từ Email. Hệ thống sẽ tự động đưa vào hàng chờ cắt lớp và nhận diện."
  },
  {
    q: "Hóa đơn viết tay hoặc bị mờ có đọc được không?",
    a: "Hệ thống hỗ trợ AI mạnh mẽ từ Gemini 1.5 Pro hoặc Claude 3.5 Sonnet, có thể nhận diện ảnh mờ, chụp nghiêng hoặc nhòe và nhận diện chữ viết tay. Các trường thông tin có độ tự tin nhận diện (confidence score) thấp sẽ được bôi vàng hoặc đỏ để bạn đánh giá lại."
  },
  {
    q: "Tôi muốn xuất báo cáo PDF cho sếp kèm biểu đồ thì làm thế nào?",
    a: "Tại tab 'Dữ liệu đã duyệt', bạn có thể lọc các hóa đơn theo tháng hoặc nhà cung cấp. Nhấn nút 'Xuất PDF' ở góc trên bên phải để tải file báo cáo tổng hợp chuyên nghiệp (đã bao gồm biểu đồ phân tích). Bạn cũng có thể xuất file Excel theo format thông thường."
  },
  {
    q: "Làm sao để thiết lập cảnh báo vượt ngân sách chi tiêu?",
    a: "Vào tab 'Tổng quan', nhấn biểu tượng Cài đặt (Bánh răng) trên góc thẻ hiển thị ngân sách, nhập tổng số tiền cho phép trong tháng. Khi chi phí đạt hoặc vượt ngưỡng ngân sách (80%, 100%), hệ thống sẽ tự động hiển thị Thông báo (chuông) màu đỏ và Toast cảnh báo."
  },
  {
    q: "Dữ liệu hóa đơn của tôi có được bảo mật không?",
    a: "Có. Mọi hóa đơn và các chỉnh sửa của bạn đều tự động lưu trữ phục vụ cho bạn (trên Local Storage / In-memory Context của Sandbox). Chúng tôi không chia sẻ hoặc lưu vĩnh viễn hình ảnh hóa đơn của bạn. Để an toàn nhất, luôn export dữ liệu ra Excel/PDF cuối kỳ."
  }
];

export default function HelpFAQ() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-semibold text-gray-900 mb-3">Trung tâm Trợ giúp</h2>
        <p className="text-gray-500 text-lg">Tìm kiếm hướng dẫn chi tiết và các câu hỏi thường gặp</p>
      </div>

      <div className="relative mb-10 shadow-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Tìm từ khóa, ví dụ: 'upload', 'xuất báo cáo'..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4 mb-12">
        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
          <div key={i} className={`border rounded-2xl bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${openIndex === i ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-100'}`}>
            <button 
              className="w-full text-left px-6 py-5 flex justify-between items-center bg-white focus:outline-none"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <h3 className={`font-medium pr-8 text-lg ${openIndex === i ? 'text-primary-800 heading-transition' : 'text-gray-800'}`}>{faq.q}</h3>
              {openIndex === i ? <ChevronUp className="text-primary-500 shrink-0" size={24} /> : <ChevronDown className="text-gray-400 shrink-0" size={24} />}
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'pb-6 opacity-100 max-h-[500px]' : 'max-h-0 opacity-0'}`}>
              <div className="text-gray-600 border-t border-gray-100 pt-4 leading-relaxed text-base">{faq.a}</div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
            <span className="bg-gray-100 p-4 rounded-full inline-block mb-4">
               <Search className="text-gray-400 w-8 h-8" />
            </span>
            <p className="text-lg">Không tìm thấy kết quả nào với "{search}"</p>
            <p className="text-gray-400 mt-2">Thử một từ khóa khác hoặc liên hệ đội ngũ hỗ trợ.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100 p-6 rounded-2xl flex items-start gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-white p-3 rounded-xl text-primary-600 shadow-sm border border-primary-50 mt-1">
            <Mail size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-primary-900 mb-1 text-lg">Cần trợ giúp thêm?</h4>
            <p className="text-sm text-primary-700/80 mb-4 leading-relaxed">Bộ phận kỹ thuật viên luôn trực 24/7. Hỗ trợ ngay lập tức qua hộp thư.</p>
            <a href="mailto:support@accobot.vn" className="text-primary-700 font-semibold hover:text-primary-800 text-sm flex items-center gap-1 group">
               Gửi Email ngay <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4 transition-transform hover:-translate-y-1">
          <div className="bg-white p-3 rounded-xl text-blue-600 shadow-sm border border-blue-50 mt-1">
            <MessageSquare size={24} />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1 text-lg">Góp ý tính năng</h4>
            <p className="text-sm text-blue-700/80 mb-4 leading-relaxed">Góp phần xây dựng trợ lý AccoBot phù hợp với luồng nghiệp vụ kế toán của bạn.</p>
            <a href="#" className="text-blue-700 font-semibold hover:text-blue-800 text-sm flex items-center gap-1 group">
               Góp ý tại đây <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

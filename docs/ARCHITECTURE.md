# Kiến trúc Hệ thống

## 🏗 Công nghệ & Nền tảng (Tech Stack)
- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Quản lý State**: Zustand & React Context
- **AI / OCR Engine**: API Claude Vision (`claude-sonnet-4-20250514`)
- **Lưu trữ Cục bộ (Persistence)**: `localStorage`
- **Biểu đồ & Trực quan hóa**: Recharts
- **Công cụ Xuất Dữ liệu**: SheetJS (tạo Excel) / jsPDF + html2canvas + jspdf-autotable (tạo PDF)
- **Hệ thống Tìm kiếm**: Sử dụng thuật toán custom JS để lọc và khớp chuỗi một phần.

## 📁 Cấu trúc Thư mục
- `src/components/`: Tập hợp các thành phần giao diện (UI) chia theo nghiệp vụ thực tế (Ví dụ: khu vực tải file, khu vực duyệt OCR, bảng hiển thị, dashboard,...).
- `src/store.tsx`: Trạng thái toàn cục (State quản lý tập trung dựa vào Context).
- `src/types.ts`: Nơi định nghĩa các giao diện (Interfaces) và kiểu dữ liệu dùng trên toàn bộ TypeScript toàn dự án.
- `src/App.tsx`: Điểm vào (Entry module), quản lý trạng thái điều hướng chính, và sắp xếp bố cục lớp chóp hệ thống.
- `docs/`: Tài liệu tham khảo dự án.

## 🔄 Luồng Dữ liệu trạng thái (Global Context)
1. **AppStore**: Làm nhiệm vụ duy trì mảng `invoices` trung tâm hiện hành.
2. **Đồng bộ Lưu trữ nội bộ**: `store.tsx` sẽ tự động kích hoạt tiến trình đồng bộ biến đổi của `state` cập nhật thẳng vào biến `invoice_app_data` được lưu trên `localStorage` trình duyệt mạng bất kỳ lúc nào có thay đổi.
3. **Các Hành động (Actions)**: Các giao diện (Components) sẽ gọi các thao tác xác định sẵn (`ADD_INVOICE`, `UPDATE_INVOICE`, `DELETE_INVOICE`, `CLEAR_DEMO_INVOICES`) để giao tiếp hai chiều.

## 🧠 Dịch vụ Nhận dạng quang học (OCR Service)
- Các file hóa đơn khi tải lên sẽ được chuyển sang mã Base64 dưới dạng cục bộ.
- Chuỗi Base64 kết hợp cùng các System Prompt nghiêm ngặt ra lệnh cấu trúc cho AI model ép buộc giá trị trả về thuần JSON.
- JSON trả về sẽ vượt qua tầng kiểm chứng format an toàn từ phần mềm trước khi được đóng gói gộp mảng với các thông báo điểm số tin cậy rồi nạp vào Global Store.

## 🖨 Kiến trúc Kết xuất / Báo cáo
- **Hệ Excel**: Chuyển giao các mảng JSON thành định cấu trúc SheetJS và kích hoạt phương thức tải tự động tập tin `.xlsx`.
- **Hệ PDF**: Áp dụng thư viện `jspdf-autotable` với kỹ thuật tải / nộp phông chữ `.ttf` động (ví dụ: Google Roboto Font) để kết xuất tệp đồ họa dạng bảng nguyên bản ổn định, thay vì chụp ảnh html bị giảm phân giải, đồng thời tránh sập ký tự (unicode glitches) với hệ chữ tiếng Việt.

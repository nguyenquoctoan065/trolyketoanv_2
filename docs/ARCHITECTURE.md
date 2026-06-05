# Kiến trúc Hệ thống

## 🏗 Công nghệ & Nền tảng (Tech Stack)
- **Framework Chính**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (cấu hình qua PostCSS)
- **Quản lý State**: React Context (`store.tsx`) với Custom Reducer (Tương tự Redux/Zustand pattern)
- **AI / OCR Engine**: API Google Gemini 2.5 Flash (`@google/genai`)
- **Lưu trữ Cục bộ (Persistence)**: `localStorage`
- **Biểu đồ & Trực quan hóa**: Recharts
- **Công cụ Xuất Dữ liệu**: SheetJS (tạo Excel) / jsPDF + jspdf-autotable (tạo PDF)
- **Hệ thống Tìm kiếm**: Sử dụng thuật toán custom JS để lọc và khớp chuỗi một phần.

## 📁 Cấu trúc Thư mục
- `src/app/`: Chứa các tuyến đường (Routing) chính của ứng dụng Next.js.
  - `page.tsx`: Điểm vào (Entry component), quản lý trạng thái điều hướng chính, và sắp xếp bố cục UI.
  - `layout.tsx`: HTML Root layout và cấu hình Metadata.
  - `globals.css`: Tập tin CSS toàn cục khai báo cấu hình hệ thống Tailwind.
  - `api/ocr/route.ts`: Điểm nối API Route xử lý logic phía máy chủ (Server-side) cho việc phân tích ảnh bằng Gemini AI.
- `src/components/`: Tập hợp các thành phần giao diện (UI) chia theo nghiệp vụ thực tế (Ví dụ: khu vực tải file, khu vực duyệt OCR, bảng hiển thị, dashboard,...).
- `src/store.tsx`: Trạng thái toàn cục (State quản lý tập trung dựa vào Context).
- `src/types.ts`: Nơi định nghĩa các giao diện (Interfaces) và kiểu dữ liệu dùng trên toàn bộ TypeScript toàn dự án.
- `docs/`: Tài liệu tham khảo dự án, Changelog và đặc tả.

## 🔄 Luồng Dữ liệu trạng thái (Global Context)
1. **AppStore**: Làm nhiệm vụ duy trì mảng `invoices` trung tâm hiện hành.
2. **Đồng bộ Lưu trữ nội bộ**: `store.tsx` sẽ tự động kích hoạt tiến trình đồng bộ biến đổi của `state` cập nhật thẳng vào biến `invoice_app_data` được lưu trên `localStorage` trình duyệt mạng bất kỳ lúc nào có thay đổi.
3. **Các Hành động (Actions)**: Các giao diện (Components) sẽ gọi các thao tác xác định sẵn (`ADD_INVOICE`, `UPDATE_INVOICE`, `DELETE_INVOICE`, `CLEAR_DEMO_INVOICES`) để giao tiếp hai chiều.

## 🧠 Dịch vụ Nhận dạng quang học (OCR Service - Backend API)
- Frontend gửi các file hóa đơn thông qua thao tác Upload. `FormData` được gọi lên đường dẫn độc lập `/api/ocr`.
- Tại phía Server (Next.js API Route handler), bộ đệm tập tin (`Buffer`) được trích xuất thành chuỗi Base64.
- Chuỗi Base64 kết hợp cùng các System Prompt (nhấn mạnh chuẩn đầu ra JSON) sẽ được gửi thẳng đến API Gemini 2.5 Flash thông qua `@google/genai` library. Việc đặt OCR ở Backend giúp che giấu và bảo mật an toàn `GEMINI_API_KEY`.
- JSON trả về sẽ được trả ngược lại Frontend, đóng gói gộp mảng với các thông báo điểm số tin cậy (Confidence Score) rồi nạp vào Global Store.

## 🖨 Kiến trúc Kết xuất / Báo cáo
- **Hệ Excel**: Chuyển giao các mảng JSON thành định cấu trúc SheetJS và kích hoạt phương thức tải tự động tập tin `.xlsx`.
- **Hệ PDF**: Áp dụng thư viện `jspdf-autotable` với kỹ thuật tải / nộp phông chữ `.ttf` động (ví dụ: Google Roboto Font) để kết xuất tệp đồ họa dạng bảng nguyên bản ổn định, đồng thời tránh sập ký tự (unicode glitches) với hệ chữ tiếng Việt.

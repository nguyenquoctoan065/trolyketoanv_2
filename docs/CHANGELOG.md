# Nhật ký Thay đổi (Changelog)

Tất cả các sửa đổi, cải tiến lớn hay phát sinh trên dự án này đều sẽ được làm tài liệu liệt kê vào đây.

---

## [Ngày 03/06/2026] - Phiên bản Khởi tạo & Giao diện Cơ bản

### Đã thêm (Added)
- **Khởi tạo Dự án**: Thiết lập cấu trúc thư mục ban đầu cho dự án, cài đặt React, TypeScript và các thư viện hỗ trợ giao diện cơ bản.
- **Bố cục Quản trị (Admin Layout)**: Xây dựng khung Sidebar điều hướng cố định bên trái và TopHeader ở phía trên để quản lý trạng thái hiển thị.
- **Tiến trình Tải lên (Upload File)**: Thiết kế component `UploadSection` hỗ trợ kéo thả tệp tin (JPG, PNG, PDF) sử dụng thư viện `react-dropzone`.
- **Trạng thái Toàn cục (Global State)**: Khởi tạo hệ thống quản lý trạng thái React Context (`store.tsx`) kết hợp với Reducer để lưu trữ hóa đơn tạm thời vào `localStorage`.
- **Giao diện Demo**: Tích hợp tính năng nạp dữ liệu mẫu (Onboarding) giúp người dùng trải nghiệm nhanh mà không cần tải file thật.

---

## [Ngày 04/06/2026] - Xử lý AI OCR, Thống kê & Kết xuất Báo cáo

### Đã thêm (Added)
- **Hàng đợi Duyệt (Review Queue)**: Hoàn thiện màn hình đối chiếu song song 2 bên (ảnh hóa đơn gốc bên trái, form điền thông tin bên phải) hỗ trợ chỉnh sửa nhanh và hiển thị điểm tin cậy AI (Confidence Badges).
- **Hệ thống AI Engine ban đầu**: Thiết lập API kết nối với Claude Vision qua server Express độc lập để phân tích hình ảnh hóa đơn.
- **Bảng điều khiển Thống kê (Dashboard)**: Thiết kế widget thống kê nhanh (tổng chi tiêu, số hóa đơn chờ duyệt) và tích hợp biểu đồ ngân sách động bằng `Recharts`.
- **Quản lý Hóa đơn (Invoice Table)**: Tạo bảng hiển thị danh sách hóa đơn đã xác nhận, hỗ trợ tìm kiếm theo nhà cung cấp, lọc theo trạng thái và phân trang.
- **Xuất Báo cáo (Exporting)**: Tích hợp xuất file Excel qua thư viện `xlsx` (SheetJS) và xuất PDF báo cáo thông qua `jsPDF` + `jspdf-autotable`.

### Thay đổi (Changed)
- **Tối ưu hóa PDF**: Nhúng phông chữ Roboto vào luồng sinh file PDF để khắc phục triệt để lỗi hiển thị tiếng Việt có dấu.
- **Logic Chỉ số Dashboard**: Cập nhật logic tính toán trong `DashboardStats` để loại trừ các hóa đơn bị từ chối ("rejected") khỏi báo cáo chi tiêu thực tế.

### Sửa lỗi (Fixed)
- Khắc phục lỗi tính toán sai lệch tổng ngân sách khi thực hiện dọn dẹp dữ liệu hóa đơn mẫu.
- Sửa lỗi tràn bộ nhớ đồ họa khi kết xuất các báo cáo PDF có danh sách hóa đơn quá dài.

---

## [Ngày 05/06/2026] - Chuyển đổi Kiến trúc Next.js 15, Gemini AI & Tối ưu Responsive

### Đã thêm (Added)
- **Thanh điều hướng ẩn (Hamburger Menu)**: Thêm nút menu và cơ chế đóng/mở Sidebar trên điện thoại để tiết kiệm không gian hiển thị.
- **Tích hợp Cloudinary**: Thiết lập kế hoạch lưu trữ hình ảnh hóa đơn tĩnh dài hạn thay thế cho Blob URL tạm thời nhằm đảm bảo dữ liệu hiển thị tốt sau khi tải lại trang.

### Thay đổi (Changed)
- **Nâng cấp Kiến trúc (Migration)**: Chuyển đổi thành công toàn bộ dự án từ React + Vite + Express sang kiến trúc **Next.js 15 (App Router)** đồng nhất, tăng hiệu năng tải trang và bảo mật.
- **Nâng cấp AI Engine**: Di chuyển sang mô hình **Gemini 2.5 Flash** (`@google/genai`) trong Next.js API Routes (`app/api/ocr/route.ts`) giúp tăng tốc độ trích xuất JSON và tiết kiệm chi phí.
- **Tối ưu Thiết kế Di động (Responsive Design)**: 
  - Tái cấu trúc component `ReviewQueue` tự động xếp chồng (stack) trên màn hình hẹp, chuyển danh sách hàng hóa sang dạng Card-stack.
  - Tối ưu hóa bảng dữ liệu hóa đơn với thanh cuộn ngang an toàn (`overflow-x-auto`) và chuyển các bộ lọc từ hàng ngang thành hàng dọc trên thiết bị di động.
- **Nâng cấp Styling**: Cập nhật hệ thống CSS lên **Tailwind CSS v4** sử dụng `@tailwindcss/postcss`.

### Sửa lỗi (Fixed)
- Sửa lỗi TypeScript Compiler trên môi trường Next.js 15 liên quan đến kiểu dữ liệu của hàm thông báo `toast` trong `InvoiceTable.tsx`.

---

## [Ngày 06/06/2026] - Chuyển đổi Backend Supabase, Cloudinary & Bảo mật Đa người dùng

### Đã thêm (Added)
- **Hệ thống Xác thực (Supabase Auth)**: Tích hợp màn hình Đăng ký / Đăng nhập (`AuthScreen.tsx`) với giao diện kính mờ (glassmorphism) hiện đại, hỗ trợ kiểm tra định dạng email và mật khẩu tối thiểu 6 ký tự.
- **Kết nối Supabase Client**: Tạo cấu hình kết nối ứng dụng với Supabase qua SDK trong `src/lib/supabaseClient.ts`.
- **Phân quyền Đa người dùng (Multi-tenant)**: Kích hoạt chính sách bảo mật mức dòng (Row Level Security - RLS) trên database Supabase để đảm bảo dữ liệu hóa đơn của ai chỉ người đó xem và quản lý được, tránh rò rỉ thông tin kế toán.
- **Tải ảnh lên Đám mây (Cloudinary Storage)**: Tích hợp SDK Cloudinary vào API Route `/api/ocr/route.ts` để tự động upload ảnh/PDF hóa đơn lên Cloudinary, trả về liên kết ảnh tĩnh lâu dài lưu trữ vào cơ sở dữ liệu thay vì Blob URL tạm thời.
- **Tài liệu Deploy**: Viết tài liệu [DEPLOYMENT.md](file:///d:/Downloads/trolyketoanv_2/docs/DEPLOYMENT.md) hướng dẫn deploy Next.js lên Vercel chi tiết từng bước.


### Thay đổi (Changed)
- **Bộ nhớ Trạng thái (store.tsx)**: Thiết kế lại cơ chế quản lý trạng thái, chuyển đổi từ việc ghi cục bộ vào trình duyệt (`localStorage`) sang thực hiện các truy vấn bất đồng bộ thời gian thực (real-time CRUD) đồng bộ với Supabase Database.
- **Giao diện Sidebar & TopHeader**: Bổ sung thẻ hiển thị thông tin tài khoản người dùng hiện tại và nút **Đăng xuất** tích hợp hiệu ứng chuyển cảnh mượt mà ở góc dưới Sidebar.
- **Cấu hình .env**: Cấu hình mẫu các khóa kết nối Cloudinary và Supabase để phân tách bảo mật môi trường phát triển.

### Sửa lỗi (Fixed)
- **Đồng bộ hóa Trạng thái**: Khắc phục lỗi dữ liệu hóa đơn tải lên hoặc duyệt trạng thái chỉ hiển thị tạm thời rồi biến mất. Thay đổi cơ chế từ việc gọi hàm `dispatch` cục bộ sang gọi các phương thức bất đồng bộ `actions.addInvoice` và `actions.updateInvoice` để ghi nhận dữ liệu trực tiếp vào database Supabase.
- **Dịch lỗi & Kiểm tra đầu vào (Toasts & Validations)**: 
  * Bổ sung kiểm tra định dạng email bằng regex và giới hạn mật khẩu >= 6 ký tự tại màn hình xác thực với các thông báo `toast` tiếng Việt sinh động.
  * Tích hợp bộ chuyển dịch lỗi thông minh cho Supabase Auth (lỗi trùng email, sai mật khẩu, tài khoản chưa kích hoạt) sang câu văn tiếng Việt thân thiện, rõ ràng.
  * Cải tiến bộ dịch lỗi cho Gemini OCR API, hỗ trợ hiển thị thông báo chi tiết khi hết hạn mức (Quota 429) hoặc sai khóa API Key trong file `.env`.




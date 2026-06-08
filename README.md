# AccoBot — Trợ lý Kế toán tự động

AccoBot là một ứng dụng web giúp tự động hóa bước trích xuất thông tin từ hóa đơn (ảnh, PDF) bằng OCR và mô hình ngôn ngữ, cung cấp giao diện duyệt, chỉnh sửa và xuất dữ liệu sang Excel để nhập vào phần mềm kế toán.

## Tổng quan

- Tải lên hóa đơn dưới dạng ảnh hoặc PDF.
- Trích xuất thông tin quan trọng (ngày, số hóa đơn, đơn vị bán, hàng hóa, số lượng, đơn giá, tổng, thuế).
- Cho phép nhân viên kế toán duyệt và chỉnh sửa dữ liệu trước khi lưu.
- Xuất báo cáo/ danh sách sang file Excel (`.xlsx`).

## Tính năng chính

- Tải lên đa định dạng: JPG, PNG, PDF.
- Xử lý OCR + AI để nhận diện trường dữ liệu chính.
- Hàng đợi duyệt (Review Queue) để so sánh ảnh gốc và dữ liệu trích xuất.
- Bảng quản lý hóa đơn đã duyệt và dashboard thống kê cơ bản.
- Xuất dữ liệu sang Excel để sử dụng trong các phần mềm kế toán.

## Kiến trúc & Công nghệ (tổng quan)

- `Next.js` (App Router) + TypeScript
- `Tailwind CSS` cho styling
- `@google/genai` (Google Gemini) để tích hợp AI
- Một API route xử lý OCR tại `src/app/api/ocr/route.ts`
- `lib/supabaseClient.ts` có cấu hình Supabase (tùy chọn dùng để lưu dữ liệu)

> Ghi chú: repo có thể tích hợp các dịch vụ khác nhau tuỳ theo cấu hình (Supabase, Google Gemini, v.v.).

## Cài đặt nhanh (Local)

1. Cài đặt Node.js (khuyến nghị >= 18).
2. Cài đặt phụ thuộc:

```bash
npm install
```

3. Tạo file biến môi trường `.env.local` hoặc `.env` ở thư mục gốc và thêm tối thiểu:

```env
GEMINI_API_KEY="<API_KEY_CỦA_BẠN>"
SUPABASE_URL="<SUPABASE_URL (nếu dùng)>"
SUPABASE_ANON_KEY="<SUPABASE_ANON_KEY (nếu dùng)>"
# Nếu có biến khác, thêm ở đây
```

4. Chạy ở chế độ phát triển:

```bash
npm run dev
```

5. Build và chạy production:

```bash
npm run build
npm run start
```

## Cách sử dụng (ngắn)

- Mở ứng dụng, vào khu vực tải lên, kéo-thả hoặc chọn file hóa đơn.
- Sau khi trích xuất, vào phần `Review Queue` để kiểm tra và chỉnh sửa các trường không chính xác.
- Khi đã duyệt xong, xuất danh sách theo định dạng Excel để lưu hoặc nhập vào hệ thống kế toán.

## Triển khai

- Triển khai lên Vercel, Docker, hoặc Cloud Run đều được. Khi deploy, đảm bảo các API key (ví dụ `GEMINI_API_KEY`, Supabase keys) được lưu ở dạng Secret trên nền tảng, không để lộ trên client.

## Đóng góp

- Mọi góp ý, báo lỗi hoặc PR xin gửi lên repository. Ghi rõ mô tả thay đổi và cách kiểm tra.

## Liên hệ

- Nếu cần hỗ trợ nhanh, để lại issue hoặc contact trong phần mô tả dự án.

---

Phiên bản README này đã được viết lại để rõ ràng hơn cho người phát triển và người dùng tiếng Việt. Nếu bạn muốn tôi bổ sung phần hướng dẫn chi tiết hơn (ví dụ cấu hình Supabase, cách dùng Google Gemini, hoặc ví dụ API), hãy cho biết yêu cầu cụ thể.

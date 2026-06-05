# Đặc tả Sản phẩm: Công cụ OCR Hóa đơn (AccoBot)

## 🎯 Mục tiêu
Một ứng dụng web giúp tự động hóa quá trình nhập liệu hóa đơn cho kế toán viên, giảm thời gian xử lý mỗi hóa đơn từ vài phút xuống dưới 30 giây rưỡi.

## 👥 Đối tượng người dùng
Kế toán viên làm việc trong các doanh nghiệp vừa và nhỏ, những người thường xuyên thao tác nhập liệu hóa đơn thủ công vào phần mềm kế toán mỗi ngày.

## 🚀 Các Tính năng cốt lõi & Quy trình
1. **Tải lên / Thu thập hình ảnh**: Kéo và thả file, hoặc chọn nhiều hóa đơn cùng một lúc (hỗ trợ JPG, PNG, HEIC, PDF).
2. **Trích xuất thông minh (OCR)**: Tự động trích xuất 12 trường thông tin cốt lõi thông qua API **Gemini 2.5 Flash**.
3. **Kiểm tra & Chỉnh sửa**: Giao diện hiển thị song song (Hình ảnh đối chiếu Dữ liệu trích xuất) kèm theo điểm độ tin cậy để hỗ trợ xác minh thủ công nhanh chóng.
4. **Quản lý Dữ liệu**: Hiển thị bảng tổng hợp toàn bộ hóa đơn đi kèm các công cụ lọc, tìm kiếm nâng cao và phân trang.
5. **Insights / Báo cáo**: Bảng điều khiển (Dashboard) với các số liệu và biểu đồ trực quan như tổng quan tài chính, tình hình ngân sách.
6. **Xuất file**: Yêu cầu chỉ qua 1 thao tác click để xuất sổ sách sang Excel (cho phần mềm) hoặc PDF (để minh chứng, báo cáo).

## 📊 Mô hình Dữ liệu
12 trường thông tin thiết yếu trích xuất từ mỗi hóa đơn:
- Ngày hóa đơn (Invoice Date)
- Số hóa đơn (Invoice Number)
- Tên nhà cung cấp (Vendor Name)
- Mã số thuế (Vendor Tax Code)
- Danh sách vật tư/hàng hóa (Items/Descriptions)
- Số lượng (Quantity)
- Đơn giá (Unit Price)
- Thành tiền trước thuế (Subtotal)
- Thuế suất VAT (VAT rate)
- Tiền thuế VAT (VAT amount)
- Tổng cộng thanh toán (Total Amount)
- Ghi chú (Notes - nếu có)

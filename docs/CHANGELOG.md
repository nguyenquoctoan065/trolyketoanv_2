# Nhật ký Thay đổi (Changelog)

Tất cả các sửa đổi, cải tiến lớn hay phát sinh trên dự án này đều sẽ được làm tài liệu liệt kê vào đây.

## [Phiên bản hiện tại - Chưa phát hành]
### Đã thêm (Added)
- **UI & Bố cục hệ thống**: Hoàn thiện khung dàn ý cấu trúc ứng dụng toàn cảnh, Header điều hướng (TopHeader) và Thanh Sidebar tương tác ở phía cạnh.
- **Tiến trình Tải lên Hóa đơn**: Cơ chế xử lý Kéo - thả mượt mà với những file cần upload.
- **Hàng đợi Duyệt (Review Queue)**: Màn hình đối chiếu thông tin 2 bên trái - phải. Trong đó tích hợp cơ chế thu / phóng tỷ lệ dành cho Hình ảnh Hóa đơn và giao diện điền Form chỉnh sửa nhanh dữ liệu quét OCR.
- **Huy hiệu Điểm Nhận dạng (Confidence Badges)**: Cải tiến phân biệt màu sắc và chỉ báo mức độ rủi ro (đỏ/vàng/xanh) linh hoạt phản hồi dựa trên tỷ lệ chuẩn xác của dữ liệu được AI trả ra.
- **Bảng điều khiển (Dashboard)**: Tích hợp nhiều Widget theo dõi con số bao quát, biểu đồ hình biểu diễn trạng thái chờ xử lý - đã duyệt, cũng như các biểu diễn thống kê biến số chi tiêu - giới hạn ngân sách hàng tháng (đươc cung cấp qua bộ công cụ Recharts).
- **Hệ thống Lưu trữ Bảng (Table View)**: Tập hợp các hóa đơn lưu chung vào luồng bảng phân trang chuyên biệt.
- **Tính năng Lọc & Tìm kiếm**: Mạng tìm kiếm đa tham số (ví dụ: nhà cung ứng, số tiền thanh toán, mốc ngày tháng...).
- **Cụm Module Kết xuất Số liệu Biên nhận (Exporting Modules)**: 
  - Khả năng tích hợp trích xuất trực tiếp thành format Excel phổ biến cho dân kế toán (thông qua SheetJS).
  - Kết xuất nguyên mảng báo cáo thống kê qua file hình thái PDF gọn gàng đạt chuẩn văn bản hành chính với `jsPDF` và `jspdf-autotable`.
- **Tính năng Làm quen dữ liệu (Onboarding)**: Xây dựng bộ chức năng gọi hàng loạt dữ liệu mẫu (demo) vào làm ví dụ trực quan nhằm cải thiện tính trơn tru khi test của khách hàng lần đầu thực tế trãi nghiệm App.

### Thay đổi (Changed)
- Chỉnh sửa lại luồng phân tích dữ liệu tại tệp `DashboardStats`: Từ giờ, các hóa đơn có phân loại trạng thái `"rejected" (từ chối)` sẽ nghiễm nhiên bị loại trừ khỏi chỉ số tổn thất tài chính, cũng như các giới hạn hạn mức phân bổ hàng tháng của Kế toán.
- Thiết kế lại hệ thống của công cụ tạo văn bản `jsPDF` bằng việc nhúng lệnh tải phông chữ (Roboto) bản địa dạng TTF tại thời điểm gọi export. Ràng buộc chuẩn chỉnh quá trình ép khối font Unicode để bảo vệ cấu trúc chữ cái có dấu Tiếng Việt hiển thị đạt chuẩn trên giao diện PDF xuất phẩm.
- Tối ưu Trạng thái Quản lý Toàn cục (Global State): Gom cụm chu trình hàm `clearDemoInvoices` tạo ra một dòng rà soát duy nhất trong Store để quét và xóa thông tin các hóa đơn mang mác `demo`, hỗ trợ việc dọn rác bộ nhớ nhanh chóng khi khách tắt app.

### Sửa lỗi (Fixed)
- Sửa tình trạng khi ấn Dọn dẹp/Xóa Dữ liệu Mẫu mà cấu trúc trạng thái cũ vẫn còn cộng dồn sai lệch tổng tiền trước thuế của bảng Thống kê (Dashboard header calculation).
- Loại trừ vĩnh viễn rủi ro giao diện xuất ảnh bảng dữ liệu khi xuất PDF dài (nhiều trang) bị nghẽn đồ họa tràn viền hoặc che khuất (nhờ nâng cấp phương thức jspdf autotable thay thế html2canvas snapshot).

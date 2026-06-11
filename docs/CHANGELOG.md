# Nhật ký Thay đổi (Changelog)

Tất cả các sửa đổi, cải tiến lớn hay phát sinh trên dự án này đều sẽ được làm tài liệu liệt kê vào đây.
## [Ngày 11/06/2026] - Cải tiến Quy trình Xử lý Hóa đơn & Sửa lỗi Đồng bộ
### Sửa lỗi (Fixed)
- **Lỗi hiển thị sau khi Bỏ qua Cảnh báo Trùng lặp**: Khắc phục tình trạng hóa đơn không lưu vào kho dữ liệu khi người dùng chọn "Vẫn thêm mới". Bổ sung gọi `actions.addInvoice` bên trong `DuplicateWarningModal` để đảm bảo lưu dữ liệu ngay lập tức. Cảnh báo trùng lặp hiện tại chỉ xuất hiện đúng lúc khi có hóa đơn trong kho khớp thông tin (chống nhầm lẫn).
- **Lỗi quét ảnh hóa đơn chập chờn**: Đã hủy bỏ cơ chế Fallback (để tránh lỗi model not found trên SDK mới). Lỗi `429 - Quota Exceeded` hiện tại sẽ được bắt và hiển thị cảnh báo để người dùng chủ động nâng cấp gói, giữ nguyên các tính năng quét cũ.
- **Lỗi "đã xóa hóa đơn nhưng vẫn báo trùng lặp"**: Thuật toán kiểm tra trùng lặp (`checkDuplicates`) đã được cập nhật để **bỏ qua các hóa đơn đã bị loại bỏ (rejected)**. Người dùng sẽ không bị báo trùng lặp "ảo" với các hóa đơn nằm trong thùng rác hoặc đã xóa khỏi kho.
- **Lỗi "Vẫn thêm mới" không xuất hiện trong Kho**: Cập nhật hệ thống để khi ấn **"Vẫn thêm mới"** trong cảnh báo trùng lặp hoặc khi **Tạo hóa đơn mẫu**, hóa đơn sẽ được đặt trạng thái `confirmed` và **xuất hiện ngay lập tức trong Kho lưu trữ** thay vì bị ẩn ở mục Chờ duyệt.
- **Lỗi HTTP 500 khi Đồng bộ Offline**: Giải quyết lỗi biên dịch và gọi API Gemini do mất MIME type của tệp khi khôi phục từ IndexedDB (trình duyệt gửi tệp dưới dạng `application/octet-stream`). Tích hợp bộ tự động nhận diện và suy luận MIME type dựa vào đuôi mở rộng của tệp cả ở client ([OfflineSyncManager.tsx](file:///c:/Users/ad/Documents/Word%20c%E1%BB%A7a%20thu%20h%E1%BA%A1/trolyketoanv_2/src/OfflineSyncManager.tsx), [useOfflineSync.ts](file:///c:/Users/ad/Documents/Word%20c%E1%BB%A7a%20thu%20h%E1%BA%A1/trolyketoanv_2/src/lib/useOfflineSync.ts)) và ở server API Route ([route.ts](file:///c:/Users/ad/Documents/Word%20c%E1%BB%A7a%20thu%20h%E1%BA%A1/trolyketoanv_2/src/app/api/ocr/route.ts)).
- **Lỗi kiểm tra trùng lặp (Duplicate Detection)**: Sửa lại điều kiện kiểm tra hóa đơn trùng lặp, hóa đơn bị tính là trùng nếu "Số hóa đơn giống nhau VÀ (có chung Mã số thuế HOẶC chung Tên nhà cung cấp HOẶC chung Tổng tiền)". Cải thiện thuật toán trích xuất dữ liệu thông minh trong `utils.ts` để đọc và so khớp các giá trị dạng lồng ({value:...}) một cách an toàn. Tự động hiển thị thẻ [CẢNH BÁO TRÙNG LẶP] khi thực hiện quét offline.
- **Lỗi quét hóa đơn khi vừa bật mạng**: Cải tiến quá trình đồng bộ tự động `OfflineSyncManager`, thêm độ trễ (delay 3 giây) sau khi bắt được sự kiện "online" để đảm bảo kết nối mạng đã thực sự ổn định trước khi gọi API, khắc phục tình trạng gọi lỗi HTTP 500 khi vừa bật wifi/4G. Tích hợp trực tiếp kiểm tra trùng lặp cho các hóa đơn đồng bộ ngầm.

### Đã thêm (Added)
- **Tính năng Chụp và Lưu Offline**: Cho phép người dùng tải lên hoặc chụp ảnh hóa đơn ngay cả khi không có kết nối mạng. Hóa đơn được lưu an toàn vào IndexedDB của trình duyệt.
- **Tự động Đồng bộ (Auto-sync)**: Hệ thống tự động phát hiện khi có mạng trở lại và thực hiện OCR + Upload toàn bộ hóa đơn đang chờ trong hàng đợi.
- **Widget Hàng đợi Offline (`OfflineQueue`)**: Một widget nhỏ góc màn hình hiển thị số lượng hóa đơn đang chờ đồng bộ, kèm modal chi tiết để quản lý (xem trạng thái, lỗi, xóa).
- **Quản lý IndexedDB (`offlineDb.ts`)**: Sử dụng thư viện `idb` để quản lý cơ sở dữ liệu cục bộ `invoice-offline` hiệu quả.
- **Trình quản lý Đồng bộ (`OfflineSyncManager.tsx`)**: Thành phần chạy ngầm xử lý việc đẩy dữ liệu lên server khi điều kiện mạng cho phép.

### Thay đổi (Changed)
- **Cải tiến `UploadSection`**: Tích hợp logic kiểm tra kết nối mạng. Nếu offline, tệp tin sẽ được chuyển hướng lưu vào bộ nhớ cục bộ thay vì gọi API.

## [Ngày 11/06/2026] - Cải tiến Quy trình Xử lý Hóa đơn & Sửa lỗi Đồng bộ
### Sửa lỗi (Fixed)
- **Lỗi hiển thị sau khi Bỏ qua Cảnh báo Trùng lặp**: Khắc phục tình trạng hóa đơn không lưu vào kho dữ liệu khi người dùng chọn "Vẫn thêm mới". Bổ sung gọi `actions.addInvoice` bên trong `DuplicateWarningModal` để đảm bảo lưu dữ liệu ngay lập tức. Cảnh báo trùng lặp hiện tại chỉ xuất hiện đúng lúc khi có hóa đơn trong kho khớp thông tin (chống nhầm lẫn).
- **Lỗi quét ảnh hóa đơn chập chờn**: Đã hủy bỏ cơ chế Fallback (để tránh lỗi model not found trên SDK mới). Lỗi `429 - Quota Exceeded` hiện tại sẽ được bắt và hiển thị cảnh báo để người dùng chủ động nâng cấp gói, giữ nguyên các tính năng quét cũ.
- **Lỗi "đã xóa hóa đơn nhưng vẫn báo trùng lặp"**: Thuật toán kiểm tra trùng lặp (`checkDuplicates`) đã được cập nhật để **bỏ qua các hóa đơn đã bị loại bỏ (rejected)**. Người dùng sẽ không bị báo trùng lặp "ảo" với các hóa đơn nằm trong thùng rác hoặc đã xóa khỏi kho.
- **Lỗi "Vẫn thêm mới" không xuất hiện trong Kho**: Cập nhật hệ thống để khi ấn **"Vẫn thêm mới"** trong cảnh báo trùng lặp hoặc khi **Tạo hóa đơn mẫu**, hóa đơn sẽ được đặt trạng thái `confirmed` và **xuất hiện ngay lập tức trong Kho lưu trữ** thay vì bị ẩn ở mục Chờ duyệt.
- **Lỗi HTTP 500 khi Đồng bộ Offline**: Giải quyết lỗi biên dịch và gọi API Gemini do mất MIME type của tệp khi khôi phục từ IndexedDB (trình duyệt gửi tệp dưới dạng `application/octet-stream`). Tích hợp bộ tự động nhận diện và suy luận MIME type dựa vào đuôi mở rộng của tệp cả ở client ([OfflineSyncManager.tsx](file:///c:/Users/ad/Documents/Word%20c%E1%BB%A7a%20thu%20h%E1%BA%A1/trolyketoanv_2/src/OfflineSyncManager.tsx), [useOfflineSync.ts](file:///c:/Users/ad/Documents/Word%20c%E1%BB%A7a%20thu%20h%E1%BA%A1/trolyketoanv_2/src/lib/useOfflineSync.ts)) và ở server API Route ([route.ts](file:///c:/Users/ad/Documents/Word%20c%E1%BB%A7a%20thu%20h%E1%BA%A1/trolyketoanv_2/src/app/api/ocr/route.ts)).
- **Lỗi kiểm tra trùng lặp (Duplicate Detection)**: Sửa lại điều kiện kiểm tra hóa đơn trùng lặp, hóa đơn bị tính là trùng nếu "Số hóa đơn giống nhau VÀ (có chung Mã số thuế HOẶC chung Tên nhà cung cấp HOẶC chung Tổng tiền)". Cải thiện thuật toán trích xuất dữ liệu thông minh trong `utils.ts` để đọc và so khớp các giá trị dạng lồng ({value:...}) một cách an toàn. Tự động hiển thị thẻ [CẢNH BÁO TRÙNG LẶP] khi thực hiện quét offline.
- **Lỗi quét hóa đơn khi vừa bật mạng**: Cải tiến quá trình đồng bộ tự động `OfflineSyncManager`, thêm độ trễ (delay 3 giây) sau khi bắt được sự kiện "online" để đảm bảo kết nối mạng đã thực sự ổn định trước khi gọi API, khắc phục tình trạng gọi lỗi HTTP 500 khi vừa bật wifi/4G. Tích hợp trực tiếp kiểm tra trùng lặp cho các hóa đơn đồng bộ ngầm.

### Đã thêm (Added)
- **Tính năng Chụp và Lưu Offline**: Cho phép người dùng tải lên hoặc chụp ảnh hóa đơn ngay cả khi không có kết nối mạng. Hóa đơn được lưu an toàn vào IndexedDB của trình duyệt.
- **Tự động Đồng bộ (Auto-sync)**: Hệ thống tự động phát hiện khi có mạng trở lại và thực hiện OCR + Upload toàn bộ hóa đơn đang chờ trong hàng đợi.
- **Widget Hàng đợi Offline (`OfflineQueue`)**: Một widget nhỏ góc màn hình hiển thị số lượng hóa đơn đang chờ đồng bộ, kèm modal chi tiết để quản lý (xem trạng thái, lỗi, xóa).
- **Quản lý IndexedDB (`offlineDb.ts`)**: Sử dụng thư viện `idb` để quản lý cơ sở dữ liệu cục bộ `invoice-offline` hiệu quả.
- **Trình quản lý Đồng bộ (`OfflineSyncManager.tsx`)**: Thành phần chạy ngầm xử lý việc đẩy dữ liệu lên server khi điều kiện mạng cho phép.

### Thay đổi (Changed)
- **Cải tiến `UploadSection`**: Tích hợp logic kiểm tra kết nối mạng. Nếu offline, tệp tin sẽ được chuyển hướng lưu vào bộ nhớ cục bộ thay vì gọi API.

## [Ngày 10/06/2026] - Chụp và Lưu Offline, Tự động Đồng bộ hóa
### Đã thêm (Added)
- **Tính năng chụp và lưu hóa đơn khi offline**: Tích hợp IndexedDB (thông qua thư viện `idb`) để lưu trữ ảnh và metadata hóa đơn khi không có kết nối mạng.
- **Tự động đồng bộ (Auto-sync)**: Xây dựng cơ chế lắng nghe sự kiện `online` để tự động kích hoạt OCR và upload hóa đơn từ bộ nhớ tạm lên Supabase.
- **Widget Hàng đợi Offline (`OfflineQueue`)**: Hiển thị thông báo số lượng hóa đơn chờ đồng bộ và modal chi tiết trạng thái (Chờ sync, Đang xử lý, Lỗi).
- **Quản lý đồng bộ (`OfflineSyncManager`)**: Thành phần chạy ngầm xử lý việc thử lại (retry) và cập nhật trạng thái đồng bộ real-time.
### Thay đổi (Changed)
- **Khu vực Tải lên (`UploadSection.tsx`)**: Cập nhật luồng xử lý để tự động chuyển hướng lưu offline nếu phát hiện mất kết nối internet.
- **Xuất báo cáo PDF**: Cập nhật hàm `handleExportPDF` để in thêm khoảng thời gian áp dụng bộ lọc lên tiêu đề báo cáo PDF và tự động căn chỉnh vị trí bảng (`startY: 56`) để tránh bị đè chữ.
- **Nút xóa bộ lọc**: Cập nhật hành động "Xóa thiết lập bộ lọc" để xóa đồng thời cả `startDate` và `endDate` về rỗng.
- ## [Ngày 09/06/2026] - Phát hiện trùng lặp, Biểu đồ Top 5 Nhà cung cấp & Cải tiến Toàn diện
### Thay đổi (Changed)
- **Logic lọc hóa đơn**: Tích hợp các hàm `parse`, `parseISO`, `isValid`, `isBefore`, `isAfter`, `startOfDay`, `endOfDay` từ `date-fns` để phân tích và so khớp chính xác ngày hóa đơn (hỗ trợ cả định dạng `dd/MM/yyyy` và `yyyy-MM-dd`) với khoảng thời gian đã chọn.
### Đã thêm (Added)
- **Props startDate/endDate cho InvoiceTable**: Thêm kiểu interface `InvoiceTableProps` và cập nhật hàm khởi tạo component `InvoiceTable` hỗ trợ nhận hai props tùy chọn `startDate` và `endDate` để thiết lập khoảng thời gian mặc định/từ ngoài vào.
- **Bộ chọn khoảng ngày inline (Inline Date Range Picker)**: Tích hợp thêm 2 trường chọn ngày ("Từ ngày" và "Đến ngày") trực tiếp vào phần bộ lọc nâng cao (`showFilters`) của component `InvoiceTable` mà không dùng thư viện ngoài.
- **Hiển thị số lượng bản ghi**: Bổ sung dòng thông báo trạng thái "Sẽ xuất X bản ghi" ngay phía trên các nút xuất dữ liệu, giúp người dùng nắm bắt số lượng bản ghi sẽ export.
- **Tính năng Phát hiện trùng lặp Hóa đơn (Duplicate Detection & Double Upload Prevention)**:
  - Tích hợp kiểm tra trùng lặp thời gian thực ngay tại backend `server.ts` sử dụng Supabase. Kết nối so sánh Số hóa đơn, Mã số thuế, và Tổng thanh toán.
  - Xây dựng component `DuplicateWarningModal` tinh xảo với phác thảo cảnh báo màu hổ phách hiển thị danh sách hóa đơn trùng (tối đa 3 bản ghi), cho phép accordion `Xem` chi tiết từng HĐ trùng khớp.
  - Quản lý 2 nhánh quyết định rõ ràng: "Bỏ qua, không thêm" (hủy bỏ upload) và "Vẫn thêm mới" (lưu hóa đơn kèm kích hoạt cơ chế ghi nhật ký hệ thống `added_despite_duplicate` lưu vào Supabase và cục bộ).
  - Phòng chống lỗi: tự động bỏ qua kiểm tra nếu OCR bị thiếu dữ liệu và xử lý mượt mà khi Supabase bị lỗi kết nối để không sản sinh lỗi block luồng tải lên.
- **Biểu đồ Top 5 Nhà cung cấp (Top 5 Vendors Interactive Widget)**:
  - Thiết kế widget xếp hạng chi tiêu Top 5 Nhà cung cấp trong tab Tổng quan sử dụng Recharts BarChart ngang (`layout="vertical"`).
  - Tích hợp điều khiển lọc theo tháng bằng Input Month tinh tế kèm hiệu ứng chuyển cảnh Loading mô phỏng và trạng thái trống (Empty State) sinh động.
  - Liên kết tương tác chiều sâu: Click trực tiếp vào cột biểu đồ để kích hoạt lọc tìm kiếm tức thì theo Tên nhà cung cấp tại bảng Kho lưu trữ hóa đơn và tự động điều phối chuyển trang mượt mà.
- **Thiết lập Design System (`src/styles/design-tokens.css` tích hợp vào `src/index.css`)**:
  - Khai báo biến CSS `:root` cho màu sắc chủ đạo (`--color-primary`, `--color-primary-hover`, `--color-primary-light`, v.v.), typography và bóng mờ hiển thị.
  - Định nghĩa kiểu dáng cơ bản toàn cục cho `button.primary`, `button.secondary`, inputs, selects, thẻ `.card` và các lớp trạng thái huy hiệu `.badge-success`, `.badge-warning`, `.badge-danger`.
  - Thêm lớp tiện ích `.vnd-number` định dạng căn phải và sử dụng dạng số tabular.
- **Nâng cấp Bảng Hóa đơn (`InvoiceTable.tsx`)**:
  - **Sticky Header**: Cố định dòng tiêu đề bảng kế toán trên cùng khi cuộn, kết hợp đổ bóng sắc nét.
  - **Row States (Lớp CSS CSS Classes)**: Phân rã 3 trạng thái của hàng (`row-default`, `row-hover` khi hover đổi màu nền mịn màng trong `150ms`, `row-selected` khi chọn dòng).
  - **Huy hiệu Trạng thái**: Thắt chặt thiết kế các Badge (hình Pill bo tròn nhỏ gọn) đồng bộ với bảng màu thành phần.
  - **Sắp xếp Thần tốc (Sortable Columns)**: Tích hợp sắp xếp theo **Ngày HĐ** và **Thanh toán** với biểu tượng mũi tên định vị trực quan.
  - **Thanh thao tác Hàng loạt (Bulk Action Bar)**: Khi người dùng chọn từ 2 hóa đơn trở lên, thanh thao tác nổi sẽ hiển thị ở cuối bảng hỗ trợ xuất nhanh PDF / Excel hoặc hủy lược chọn.
  - **Trạng thái Trống (Empty State)**: Làm mới thiết kế màn hình khi tìm kiếm trống trực quan sinh động kèm nút hành động quay lại.
- **Nâng cấp Khu vực Tải lên (`UploadSection.tsx`) - Batch Upload Song Song**:
  - **Xử lý Bất đồng bộ Đa tệp**: Tích hợp điều phối đồng thời ít nhất 5 tệp tin song song qua module `Promise.allSettled`.
  - **Mô hình Quản lý Trạng thái Mới (`FileTrack`)**: Theo dõi hành trình `pending` -> `uploading` -> `done` -> `error` của từng tệp riêng rẽ.
  - **Cải tiến Tiến độ Chi tiết**: Thắp sáng tiến trình xử lý riêng của từng tệp từ `0% -> 30% (Tải lên) -> 70% (OCR Phân tích) -> 100% (Hoàn thành)`.
  - **Thanh Tiến độ Rực rỡ**: Sử dụng hệ mã màu tiêu chuẩn mới cho thanh trạng thái (`#378ADD` xanh lam khi tải lên, `#1D9E75` xanh lục khi hoàn thành, `#E24B4A` đỏ khi phát sinh lỗi).
  - **Tóm tắt Tiến độ (Summary Footer)**: Khung tổng hợp kết quả màu xanh lá hiển thị sau khi hoàn thành với hai lối tắt "Xem kết quả →" hoặc "Upload thêm".

### Cải tiến (Changed)
- **Thiết kế PDF Đẳng cấp Quốc tế**:
  - Tích hợp thanh trang trí màu xanh thương hiệu ở đầu trang báo cáo PDF.
  - Tạo hộp thông tin tổng hợp (dashboard panel) nền xanh nhạt rực rỡ `#EEF3FD` chứa các thông số: thời gian lọc, lượng hóa đơn và nổi bật mục **Tổng chi tiêu thanh toán** kích thước lớn 14pt tinh tế.
  - Tăng khoảng rộng cột "Ngày HĐ", "Số HĐ" để tránh trùm khít bóp nghẹt chữ.
- **Sửa lỗi Input Tìm kiếm**:
  - Khắc phục triệt để hiện tượng đè lồng kính lúp lên văn bản bằng cách thiết lập khoảng đệm `paddingLeft: 38px` cố định cho thẻ input tại `InvoiceTable.tsx`.
- **Căn chỉnh Xuất PDF**: 
  - Điều chỉnh khoảng cách vùng tiêu đề biểu mẫu PDF gọn gàng (`startY: 56`) để tránh bị đè chữ bảng dữ liệu.
  - Bổ sung thông tin khoảng thời gian lọc và tổng số lượng bản ghi hiển thị linh hoạt trong báo cáo xuất tệp.

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
  - Tối ưu hóa bảng dữ liệu hóa đơn with thanh cuộn ngang an toàn (`overflow-x-auto`) và chuyển các bộ lọc từ hàng ngang thành hàng dọc trên thiết bị di động.
- **Nâng cấp Styling**: Cập nhật hệ thống CSS lên **Tailwind CSS v4** sử dụng `@tailwindcss/postcss`.

### Sửa lỗi (Fixed)
- Sửa lỗi TypeScript Compiler trên môi trường Next.js 15 liên quan đến kiểu dữ liệu của hàm thông báo `toast` trong `InvoiceTable.tsx`.

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

## [Ngày 03/06/2026] - Phiên bản Khởi tạo & Giao diện Cơ bản

### Đã thêm (Added)
- **Khởi tạo Dự án**: Thiết lập cấu trúc thư mục ban đầu cho dự án, cài đặt React, TypeScript và các thư viện hỗ trợ giao diện cơ bản.
- **Bố cục Quản trị (Admin Layout)**: Xây dựng khung Sidebar điều hướng cố định bên trái và TopHeader ở phía trên để quản lý trạng thái hiển thị.
- **Tiến trình Tải lên (Upload File)**: Thiết kế component `UploadSection` hỗ trợ kéo thả tệp tin (JPG, PNG, PDF) sử dụng thư viện `react-dropzone`.
- **Trạng thái Toàn cục (Global State)**: Khởi tạo hệ thống quản lý trạng thái React Context (`store.tsx`) kết hợp với Reducer để lưu trữ hóa đơn tạm thời vào `localStorage`.
- **Giao diện Demo**: Tích hợp tính năng nạp dữ liệu mẫu (Onboarding) giúp người dùng trải nghiệm nhanh mà không cần tải file thật.

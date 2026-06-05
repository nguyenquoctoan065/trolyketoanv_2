# INVOICE OCR TOOL
## Tài liệu Sản phẩm & Kế hoạch Sprint
*Dành cho Lark Base | Phiên bản 1.0*

| **Dự án** | Invoice OCR Tool — Tự động hóa nhập liệu hóa đơn kế toán |
| --- | --- |
| **Người dùng mục tiêu** | Thắm — Kế toán tại doanh nghiệp vừa và nhỏ, Hà Nội |
| **Phiên bản tài liệu** | 1.0 — Sprint Planning Document |
| **Tổng số Sprint** | 3 Sprint │ 23 User Stories │ 83 Story Points |

# 1. BA CÂU HỎI VÀNG

## 1.1 Người dùng là ai?

| **Tên / Tuổi** | **Thắm, 21 tuổi** |
| --- | --- |
| **Nghề nghiệp** | Kế toán tại một công ty nhỏ ở Hà Nội |
| **Bối cảnh công việc** | Nhận hóa đơn từ 3 nguồn: Zalo, file giấy chụp ảnh. Nhập tay vào Excel rồi copy sang phần mềm kế toán. |
| **Thời gian bị mất** | **2–3 tiếng mỗi ngày cho công việc nhập liệu thủ công** |
| **Thiết bị sử dụng** | Máy tính văn phòng + điện thoại di động (chụp ảnh hóa đơn tại chỗ) |

## 1.2 Họ khổ vì điều gì? (Pain Points)

| **#** | **Pain Point** | **Mô tả chi tiết** |
| --- | --- | --- |
| **P1** | **Nhập tay nhiều, dễ sai** | Mỗi hóa đơn có 12+ trường dữ liệu, phải nhập thủ công 100% vào Excel |
| **P2** | **Đối soát tốn thời gian** | Khi phát hiện sai phải quay lại từ đầu: tìm hóa đơn gốc, đối chiếu từng dòng, sửa lại báo cáo |
| **P3** | **Căng thẳng cuối tháng** | Dồn tích nhiều hóa đơn, deadline báo cáo tháng tạo áp lực cực lớn, hay phải thức đêm |
| **P4** | **Sợ sai số liệu báo cáo** | Một lỗi nhỏ trong số tiền/VAT có thể ảnh hưởng toàn bộ báo cáo tài chính trình sếp |
| **P5** | **Hóa đơn đến từ nhiều kênh** | Zalo (ảnh chụp), email (PDF), tay (giấy) — không có luồng xử lý thống nhất |
| **P6** | **Hóa đơn trùng khó phát hiện** | Nhập tay dễ nhập 2 lần cùng một hóa đơn, gây sai số tổng chi phí |

## 1.3 Thành công là gì? (Definition of Success)

| **#** | **Tiêu chí thành công** | **Đo lường cụ thể** |
| --- | --- | --- |
| **S1** | **Tốc độ xử lý tăng đột biến** | Từ 2–3 tiếng/ngày xuống dưới 30 giây/hóa đơn |
| **S2** | **Tỷ lệ sai giảm mạnh** | Tỷ lệ lỗi nhập liệu dưới 1% (hiện tại ước tính 5–10%) |
| **S3** | **Không còn thức đêm** | Cuối tháng xử lý hết hóa đơn trong giờ hành chính, không cần OT |
| **S4** | **Chụp — tự động — xong** | Chụp ảnh hóa đơn → OCR tự điền → review 30s → xuất Excel 1 click |
| **S5** | **Tự tin về số liệu** | Kế toán tự tin trình báo cáo cho sếp, không lo sai VAT hay tổng tiền |
| **S6** | **Xuất file đúng chuẩn** | File Excel xuất ra import thẳng vào phần mềm kế toán không cần chỉnh sửa |

# 2. USER STORIES

Toàn bộ 23 User Stories được phân nhóm theo 6 EPIC. Mỗi story viết theo format: Là [vai trò], tôi muốn [hành động] để [lợi ích].

## EPIC 1 — Upload & Xử lý Hóa Đơn

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** |
| --- | --- | --- | --- | --- |
| US-01 | Là kế toán, tôi muốn kéo thả nhiều file hóa đơn cùng lúc để không phải upload từng cái một | Hỗ trợ drag & drop + click upload; JPG, PNG, HEIC, PDF; upload nhiều file cùng lúc | Must Have | 3 |
| US-02 | Là kế toán, tôi muốn thấy preview thumbnail ngay sau upload để biết đã chọn đúng file | Thumbnail hiển thị trong 2s; hiển thị tên file và dung lượng | Must Have | 2 |
| US-03 | Là kế toán, tôi muốn nhấn 1 nút để hệ thống tự đọc tất cả hóa đơn cùng lúc | Nút "Xử lý tất cả"; progress bar từng file; thông báo hoàn tất | Must Have | 3 |
| US-04 | Là kế toán, tôi muốn thấy trạng thái đang xử lý rõ ràng để không lo hệ thống bị treo | Loading spinner + text "Đang đọc hóa đơn..."; progress %; không block UI | Must Have | 2 |
| US-05 | Là kế toán, tôi muốn upload ảnh nghiêng/nhoè vẫn đọc được để không phải chụp lại | OCR thành công với ảnh xoay ≤15°; độ nhoè nhẹ; confidence hiển thị | Should Have | 5 |
| US-06 | Là kế toán, tôi muốn hệ thống đọc được hóa đơn viết tay để xử lý HĐ từ chợ/tiệm nhỏ | Nhận diện chữ viết tay tiếng Việt; confidence thấp tự động đánh dấu needs_review | Could Have | 8 |

## EPIC 2 — OCR & Trích Xuất Dữ Liệu

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** |
| --- | --- | --- | --- | --- |
| US-07 | Là kế toán, tôi muốn hệ thống tự điền đầy đủ thông tin hóa đơn để không nhập tay | Trích xuất đủ 12 trường: ngày, số HĐ, tên NCC, MST, hàng hóa, SL, đơn giá, thành tiền, VAT%, tổng trước thuế, tổng sau thuế, ghi chú | Must Have | 8 |
| US-08 | Là kế toán, tôi muốn thấy màu xanh/vàng/đỏ trên từng trường để biết cái nào cần kiểm tra | Xanh ≥90%; Vàng 60–89%; Đỏ <60% hoặc null; hiển thị % bên cạnh trường | Must Have | 3 |
| US-09 | Là kế toán, tôi muốn hệ thống cảnh báo khi hóa đơn bị trùng để tránh nhập 2 lần | So sánh số HĐ + tên NCC; popup cảnh báo trùng trước khi lưu; bỏ qua hoặc từ chối | Must Have | 5 |
| US-10 | Là kế toán, tôi muốn dữ liệu không mất khi vô tình tắt trình duyệt | Lưu tự động vào localStorage sau mỗi thao tác; khôi phục khi mở lại | Must Have | 3 |

## EPIC 3 — Review & Chỉnh Sửa

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** |
| --- | --- | --- | --- | --- |
| US-11 | Là kế toán, tôi muốn thấy ảnh hóa đơn gốc bên cạnh form dữ liệu để dễ đối chiếu | Layout 2 cột: ảnh trái, form phải; zoom ảnh được; scroll độc lập 2 cột | Must Have | 5 |
| US-12 | Là kế toán, tôi muốn click vào bất kỳ trường nào để sửa trực tiếp mà không cần tìm nút Edit | Inline editing; Enter/Tab để chuyển trường; auto-save khi blur | Must Have | 3 |
| US-13 | Là kế toán, tôi muốn nhấn "Xác nhận" để lưu và "Từ chối" để bỏ qua hóa đơn lỗi | Nút Xác nhận (xanh) và Từ chối (đỏ); toast tiếng Việt; tự chuyển sang HĐ tiếp theo | Must Have | 2 |
| US-14 | Là kế toán, tôi muốn xem nhanh danh sách HĐ cần review để ưu tiên xử lý cái quan trọng | Badge đỏ số lượng needs_review; filter "Cần review" trên bảng; sort theo confidence | Should Have | 3 |

## EPIC 4 — Bảng Dữ Liệu & Xuất File

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** |
| --- | --- | --- | --- | --- |
| US-15 | Là kế toán, tôi muốn xem tất cả HĐ đã xác nhận trong 1 bảng để có cái nhìn tổng quan | Bảng đủ cột: STT, Ngày, Số HĐ, NCC, MST, Tổng tiền, VAT, Trạng thái; phân trang 20 dòng | Must Have | 3 |
| US-16 | Là kế toán, tôi muốn lọc hóa đơn theo tháng và nhà cung cấp để tìm nhanh | Filter tháng (dropdown), filter NCC (search), filter trạng thái; clear filter dễ dàng | Must Have | 3 |
| US-17 | Là kế toán, tôi muốn xuất Excel 1 click đúng định dạng để import thẳng vào phần mềm kế toán | Xuất .xlsx; ngày DD/MM/YYYY; số tiền không ký tự đặc biệt; tên cột tiếng Việt đúng chuẩn | Must Have | 5 |
| US-18 | Là kế toán, tôi muốn thấy tổng chi phí và tổng VAT cuối bảng để không cần tính tay | Dòng tổng cộng cuối bảng; cập nhật realtime khi filter | Must Have | 2 |

## EPIC 5 — Dashboard & Tổng Quan

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** |
| --- | --- | --- | --- | --- |
| US-19 | Là kế toán, tôi muốn thấy số HĐ đã xử lý hôm nay ngay khi mở app | Widget: HĐ hôm nay, HĐ tháng này, Tổng chi phí tháng, Tổng VAT tháng | Should Have | 2 |
| US-20 | Là kế toán, tôi muốn thấy biểu đồ chi phí theo tuần để báo cáo sếp nhanh | Bar chart chi phí 4 tuần gần nhất; tooltip số tiền VND; responsive mobile | Should Have | 3 |
| US-21 | Là kế toán, tôi muốn thấy danh sách HĐ cần review trên dashboard để không bỏ sót | List 5 HĐ cần review gần nhất; link "Xem tất cả"; badge số lượng | Should Have | 2 |

## EPIC 6 — Trải Nghiệm Mobile

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** |
| --- | --- | --- | --- | --- |
| US-22 | Là kế toán, tôi muốn dùng điện thoại để upload ảnh chụp trực tiếp từ camera | Input accept camera; mobile-friendly upload; preview đủ lớn trên màn hình nhỏ | Should Have | 3 |
| US-23’ | Là kế toán, tôi muốn giao diện dễ dùng trên điện thoại để review HĐ khi đang di chuyển | Responsive toàn bộ; touch-friendly buttons ≥44px; swipe để chuyển hóa đơn | Could Have | 5 |

# 3. PRODUCT BACKLOG (TARGET)

Toàn bộ 23 User Stories được ưu tiên theo MoSCoW. Tổng: 83 Story Points.

| **ID** | **EPIC** | **Mô tả ngắn** | **Priority** | **Points** | **Sprint** |
| --- | --- | --- | --- | --- | --- |
| US-01 | EPIC 1 | Upload drag & drop nhiều file | Must Have | 3 | Sprint 1 |
| US-02 | EPIC 1 | Preview thumbnail sau upload | Must Have | 2 | Sprint 1 |
| US-03 | EPIC 1 | Nút "Xử lý tất cả" | Must Have | 3 | Sprint 1 |
| US-04 | EPIC 1 | Loading state OCR | Must Have | 2 | Sprint 1 |
| US-07 | EPIC 2 | OCR trích xuất 12 trường | Must Have | 8 | Sprint 1 |
| US-08 | EPIC 2 | Confidence score màu | Must Have | 3 | Sprint 1 |
| US-10 | EPIC 2 | Lưu localStorage | Must Have | 3 | Sprint 1 |
| US-11 | EPIC 3 | Layout 2 cột ảnh + form | Must Have | 5 | Sprint 2 |
| US-12 | EPIC 3 | Inline editing | Must Have | 3 | Sprint 2 |
| US-13 | EPIC 3 | Nút Xác nhận / Từ chối | Must Have | 2 | Sprint 2 |
| US-09 | EPIC 2 | Phát hiện hóa đơn trùng | Must Have | 5 | Sprint 2 |
| US-15 | EPIC 4 | Bảng tổng hợp | Must Have | 3 | Sprint 2 |
| US-16 | EPIC 4 | Bộ lọc tháng/NCC/trạng thái | Must Have | 3 | Sprint 2 |
| US-17 | EPIC 4 | Xuất Excel | Must Have | 5 | Sprint 2 |
| US-18 | EPIC 4 | Tổng cuối bảng | Must Have | 2 | Sprint 2 |
| US-19 | EPIC 5 | Widget tổng quan dashboard | Should Have | 2 | Sprint 3 |
| US-20 | EPIC 5 | Biểu đồ chi phí theo tuần | Should Have | 3 | Sprint 3 |
| US-21 | EPIC 5 | List HĐ cần review trên dashboard | Should Have | 2 | Sprint 3 |
| US-14 | EPIC 3 | Badge + filter needs_review | Should Have | 3 | Sprint 3 |
| US-22 | EPIC 6 | Mobile camera upload | Should Have | 3 | Sprint 3 |
| US-05 | EPIC 1 | Xử lý ảnh nghiêng/nhoè | Should Have | 5 | Sprint 3 |
| US-06 | EPIC 1 | Nhận diện chữ viết tay | Could Have | 8 | Sprint 3 |
|  |  | **TỔNG** |  | **83** | **3 Sprints** |

# 4. SPRINT 1 — Nền tảng Upload & OCR

| **Sprint** | **Sprint 1** |
| --- | --- |
| **Mục tiêu** | Người dùng có thể upload ảnh hóa đơn và nhận lại dữ liệu đã được OCR tự động với confidence score hiển thị rõ ràng |
| **Story Points** | **24 SP** |
| **User Stories** | US-01, US-02, US-03, US-04, US-07, US-08, US-10 |

## Sprint 1 Backlog

| **ID** | **Story** | **Dev Tasks** | **Points** | **Owner** |
| --- | --- | --- | --- | --- |
| US-01 | Upload drag & drop | Component UploadZone với react-dropzone; Validate file type JPG/PNG/HEIC/PDF; State management danh sách file | 3 SP | Trung Lê Hải |
| US-02 | Preview thumbnail | Render thumbnail từ File object (URL.createObjectURL); Render PDF page 1 bằng pdf.js; Component FileCard hiển thị tên + size | 2 SP | Trung Lê Hải |
| US-07 | OCR 12 trường | Tích hợp Claude Vision API; Convert ảnh sang base64; Prompt engineering JSON response; Parser response → typed object InvoiceData | 8 SP | Mark |
| US-08 | Confidence màu | Logic tính confidence từ Claude response; Component ConfidenceBadge (xanh/vàng/đỏ); Highlight trường cần review | 3 SP | Mark |
| US-04 | Loading state | Spinner + text "Đang đọc hóa đơn..."; Progress bar khi xử lý batch; Non-blocking UI | 2 SP | Trung Lê Hải |
| US-03 | Xử lý tất cả | Sequential/parallel API calls; Queue management; Error handling per file | 3 SP | Trung Lê Hải |
| US-10 | Lưu localStorage | Custom hook useLocalStorage; Persist invoiceList state; Restore khi reload | 3 SP | Mark |

## Sprint 1 — Definition of Done (DoD)

| **#** | **User Story** | **Definition of Done** |
| --- | --- | --- |
| 1 | US-01 | Upload 5 file cùng lúc không lỗi; file JPG/PNG/HEIC/PDF đều được chấp nhận; file ngoài định dạng bị từ chối có thông báo rõ ràng |
| 2 | US-02 | Thumbnail hiện trong 2 giây sau upload; thumbnail PDF render đúng trang 1; hiển thị tên file và dung lượng |
| 3 | US-07 | Hóa đơn chuẩn trích xuất được ≥10/12 trường; response là JSON hợp lệ; typed object InvoiceData không lỗi runtime |
| 4 | US-08 | Màu hiển thị đúng ngưỡng: xanh ≥90%, vàng 60–89%, đỏ <60%; badge cập nhật realtime theo response |
| 5 | US-04 | Loading visible khi gọi API; UI không đơ trong quá trình xử lý; progress bar hiển thị đúng % tiến độ |
| 6 | US-03 | 3 file xử lý song song; lỗi 1 file không dừng xử lý các file còn lại; thông báo hoàn tất rõ ràng |
| 7 | US-10 | Reload trang không mất dữ liệu; localStorage update sau mỗi thao tác xác nhận/từ chối; khôi phục đúng state |

### Sprint 1 — DoD Chung (áp dụng tất cả stories)

- Code được review bởi ít nhất 1 thành viên khác

- Unit test coverage ≥80% cho các function xử lý OCR response

- Không có console.error nào khi chạy happy path

- Responsive trên màn hình 1280px trở lên

- Đã demo thành công cho Product Owner

# 5. SPRINT 2 — Review, Chỉnh Sửa & Xuất File

| **Sprint** | **Sprint 2** |
| --- | --- |
| **Mục tiêu** | Người dùng có thể review, sửa dữ liệu OCR, phát hiện trùng, xem bảng tổng hợp và xuất file Excel chuẩn |
| **Story Points** | **28 SP** |
| **User Stories** | US-11, US-12, US-13, US-09, US-15, US-16, US-17, US-18 |

## Sprint 2 Backlog

| **ID** | **Story** | **Dev Tasks** | **Points** | **Owner** |
| --- | --- | --- | --- | --- |
| US-11 | Layout 2 cột | Split-pane layout component; Image viewer với zoom/pan; Scroll độc lập 2 cột; Responsive breakpoint mobile | 5 SP | Sophia |
| US-12 | Inline editing | EditableField component; Click-to-edit pattern; Tab/Enter navigation; Validation rules (ngày, số tiền) | 3 SP | Sophia |
| US-13 | Xác nhận / Từ chối | InvoiceActions component; State PENDING → CONFIRMED/REJECTED; Toast notification tiếng Việt; Auto-navigate sang HĐ tiếp theo | 2 SP | Sophia |
| US-09 | Phát hiện trùng | Duplicate detection: so sánh invoice_number + vendor_name; Modal cảnh báo trùng; Option bỏ qua hoặc từ chối | 5 SP | Mark |
| US-15 | Bảng tổng hợp | DataTable component; Cột đủ theo spec (STT, Ngày, Số HĐ, NCC, MST, Tổng tiền, VAT, Trạng thái); Phân trang 20 dòng | 3 SP | Tuấn Vũ |
| US-16 | Bộ lọc | Filter tháng (month picker); Filter NCC (search input); Filter trạng thái (select); Clear all filters | 3 SP | Tuấn Vũ |
| US-17 | Xuất Excel | SheetJS integration; Map InvoiceData → worksheet columns; Format ngày DD/MM/YYYY; Format số tiền; Tên cột tiếng Việt | 5 SP | Tuấn Vũ |
| US-18 | Tổng cuối bảng | Sum tổng tiền + VAT; Update khi filter thay đổi; Format number VND | 2 SP | Tuấn Vũ |

## Sprint 2 — Definition of Done (DoD)

| **#** | **User Story** | **Definition of Done** |
| --- | --- | --- |
| 1 | US-11 | Zoom ảnh hoạt động; scroll 2 cột không bị link nhau; layout không vỡ khi ảnh dọc/ngang |
| 2 | US-12 | Sửa field xong nhấn Enter tự chuyển sang field tiếp theo; blur auto-save; validation không cho nhập ngày sai định dạng |
| 3 | US-13 | Toast xanh/đỏ hiện đúng; sau Xác nhận/Từ chối tự chuyển sang HĐ tiếp theo; state CONFIRMED lưu đúng vào localStorage |
| 4 | US-09 | Cảnh báo trùng hiện trước khi lưu; so sánh chính xác invoice_number + vendor_name; người dùng có thể bỏ qua hoặc từ chối |
| 5 | US-15 | Bảng render đủ cột theo spec; phân trang đúng 20 dòng/trang; không lỗi khi danh sách rỗng |
| 6 | US-16 | 3 filter hoạt động độc lập và kết hợp; Clear all filters khôi phục đúng; filter tháng lọc đúng tháng |
| 7 | US-17 | File .xlsx download được; import thử vào Excel thật không lỗi; ngày dạng DD/MM/YYYY; tên cột tiếng Việt đúng |
| 8 | US-18 | Tổng cộng đúng và cập nhật khi filter thay đổi; hiển thị đúng định dạng VND |

# 6. SPRINT 3 — Dashboard, Mobile & Nâng Cao

| **Sprint** | **Sprint 3** |
| --- | --- |
| **Mục tiêu** | Người dùng có dashboard tổng quan, dùng được trên mobile, hệ thống xử lý tốt ảnh khó (nghiêng, viết tay) |
| **Story Points** | **31 SP** |
| **User Stories** | US-19, US-20, US-21, US-14, US-22, US-05, US-06 |

## Sprint 3 Backlog

| **ID** | **Story** | **Dev Tasks** | **Points** | **Owner** |
| --- | --- | --- | --- | --- |
| US-19 | Widget dashboard | StatCard component; Tính: HĐ hôm nay, HĐ tháng, Tổng chi phí, Tổng VAT; Realtime từ localStorage | 2 SP | Mark |
| US-20 | Biểu đồ tuần | Recharts BarChart; Tính chi phí 4 tuần gần nhất từ data; Tooltip VND format; Responsive | 3 SP | Mark |
| US-21 | List needs_review | InvoiceNeedsReviewList component; Lọc needs_review: true hoặc confidence thấp; Link navigate sang trang review | 2 SP | Mark |
| US-14 | Badge needs_review | Badge đỏ header navigation; Filter "Cần review" trên bảng; Sort theo confidence ascending | 3 SP | Sophia |
| US-22 | Mobile camera | Input accept="image/*" capture="camera"; Mobile upload button; Preview full-width | 3 SP | Tuấn Vũ |
| US-05 | Ảnh nghiêng/nhoè | Test với bộ ảnh nghiêng 5°/10°/15°; Pre-processing: sharpen prompt hint; Fallback confidence thấp + needs_review | 5 SP | Trung Lê Hải |
| US-06 | Chữ viết tay | Điều chỉnh Claude prompt cho handwriting; Test với 10 mẫu hóa đơn viết tay; Confidence calibration cho handwriting | 8 SP | Mark |

## Sprint 3 — Definition of Done (DoD)

| **#** | **User Story** | **Definition of Done** |
| --- | --- | --- |
| 1 | US-19 | 4 widget hiển thị đúng số liệu; số cập nhật realtime khi có thêm HĐ mới |
| 2 | US-20 | Chart render đúng 4 tuần; tooltip hiển thị đúng VND; responsive trên màn hình 375px mobile |
| 3 | US-21 | Click item trong list → navigate đến đúng HĐ đó trong trang review; badge số lượng đúng |
| 4 | US-14 | Badge đỏ cập nhật realtime khi HĐ được xác nhận/từ chối; filter "Cần review" hoạt động đúng |
| 5 | US-22 | Chụp ảnh trực tiếp từ điện thoại upload được; preview hiển thị đủ lớn trên màn hình nhỏ |
| 6 | US-05 | ≥80% ảnh nghiêng 15° đọc được; ảnh không đọc được tự đánh dấu needs_review thay vì lỗi cứng |
| 7 | US-06 | ≥60% hóa đơn viết tay đọc được chính xác; confidence calibration cho handwriting thấp hơn printed |

# 7. CẤU TRÚC LARK BASE ĐỀ XUẤT

Dưới đây là cách tổ chức các bảng (Tables) trong Lark Base để quản lý toàn bộ quá trình phát triển sản phẩm này.

## 7.1 Bảng 1: Product Backlog

| **Tên trường** | **Kiểu dữ liệu Lark** | **Ghi chú** |
| --- | --- | --- |
| Story ID | Text (Primary) | Ví dụ: US-01, US-07 |
| EPIC | Single Select | EPIC 1–6 với màu khác nhau |
| User Story | Long Text | Nội dung đầy đủ |
| Priority | Single Select | Must Have / Should Have / Could Have |
| Story Points | Number | 1–13 |
| Sprint | Single Select | Sprint 1, Sprint 2, Sprint 3 |
| Acceptance Criteria | Long Text | Tiêu chí nghiệm thu cụ thể |
| Task Leader | Person (Member) | Người phụ trách |
| Status | Single Select | Todo / In Progress / Done / Blocked |

## 7.2 Bảng 2: Sprint Backlog

| **Tên trường** | **Kiểu dữ liệu Lark** | **Ghi chú** |
| --- | --- | --- |
| Task ID | Text (Primary) | Auto hoặc T-001, T-002 |
| Linked Story | Link to Record | Link sang bảng Product Backlog |
| Dev Task | Long Text | Mô tả chi tiết task kỹ thuật |
| Sprint | Single Select | Sprint 1, 2, 3 |
| Assignee | Person (Member) | Dev phụ trách |
| Story Points | Number |  |
| Status | Single Select | Todo / In Progress / Review / Done |
| Definition of Done | Long Text | Checklist DoD cho task này |
| Tiến độ (%) | Number / Progress | 0–100% |

## 7.3 Bảng 3: Bug Tracker

| **Tên trường** | **Kiểu dữ liệu Lark** | **Ghi chú** |
| --- | --- | --- |
| Bug ID | Text (Primary) | BUG-001, BUG-002 |
| Mô tả lỗi | Long Text | Steps to reproduce |
| Severity | Single Select | Critical / High / Medium / Low |
| Linked Story | Link to Record | US liên quan |
| Assignee | Person |  |
| Status | Single Select | Open / In Fix / Resolved / Closed |

## 7.4 Views & Automation đề xuất trong Lark Base

- Gallery View trên Product Backlog: mỗi card là 1 User Story, màu theo Priority

- Kanban View trên Sprint Backlog: cột = Status (Todo / In Progress / Review / Done)

- Grouped View theo Sprint: thấy tổng Story Points mỗi Sprint

- Automation: khi Status = Done tự cập nhật % Progress; gửi notification khi bug Critical được tạo

- Dashboard: biểu đồ Burndown Chart theo Story Points; pie chart theo Priority; bar chart tiến độ mỗi EPIC

# 8. TỔNG QUAN CÁC SPRINT

| **Sprint** | **Mục tiêu chính** | **Story Points** | **User Stories** |
| --- | --- | --- | --- |
| **Sprint 1** | Nền tảng Upload & OCR — người dùng upload và nhận dữ liệu tự động | **24 SP** | US-01, 02, 03, 04, 07, 08, 10 |
| **Sprint 2** | Review & Xuất File — hoàn thiện luồng review và xuất dữ liệu ra Excel | **28 SP** | US-09, 11, 12, 13, 15, 16, 17, 18 |
| **Sprint 3** | Dashboard & Mobile — tổng quan, trải nghiệm mobile, nâng cao chất lượng OCR | **31 SP** | US-05, 06, 14, 19, 20, 21, 22 |
| **TỔNG** |  | **83 SP** | **23 User Stories** |


# 9. ACCEPTANCE CRITERIA & CHECKLIST REVIEW CHO UNIT TEST

Phần này xác định rõ Acceptance Criteria (AC) cho từng User Story và Checklist Review để xây dựng Unit Test hiệu quả. Mỗi AC được viết theo chuẩn Given–When–Then nhắm giúp developer viết test case chính xác, bảo đảm coverage ≥80% và kiểm soát chất lượng trước khi merge.

## 9.1  EPIC 1 — Upload & Xử Lý Hóa Đơn

### US-01 — Upload drag & drop nhiều file

**Acceptance Criteria:**

**Given** người dùng mở trang upload,

**When** kéo thả nhiều file JPG/PNG/HEIC/PDF vào vùng UploadZone cùng lúc,

**Then** tất cả file được thêm vào danh sách upload; file sai định dạng bị từ chối và hiển thông báo lỗi rõ ràng.

**Checklist Unit Test:**

- [ ]  Tỉch hợp đúng react-dropzone: onDrop callback nhận đúng danh sách File[]

- [ ]  Valid file types: JPG, PNG, HEIC, PDF được chấp nhận, các định dạng khác (TXT, DOCX) bị reject

- [ ]  Multiple files: upload 5 file cùng lúc, fileList.length === 5

- [ ]  State update: sau khi drop, component re-render hiển thị đúng số lượng file

- [ ]  Error message: file sai định dạng hiển thông báo chứa tên file và lý do từ chối

- [ ]  Boundary: upload 1 file, upload 0 file (drop vùng trống) — không throw exception

### US-02 — Preview thumbnail sau upload

**Acceptance Criteria:**

**Given** người dùng đã upload file thành công,

**When** component FileCard được render,

**Then** thumbnail hiển trong vòng 2 giây; hiển tên file và dung lượng đúng; PDF render đúng trang 1.

**Checklist Unit Test:**

- [ ]  URL.createObjectURL được gọi đúng 1 lần cho mỗi image file

- [ ]  FileCard hiển thị tên file đúng với file.name

- [ ]  Dung lượng hiển dạng KB hoặc MB đúng (1024 bytes = 1 KB)

- [ ]  PDF thumbnail: pdf.js renderPage(1) được gọi với pageNumber=1

- [ ]  Snapshot test: FileCard với props mẫu không thay đổi UI đột ngột

**US-03 — Nút **"**Xử lý tất cả**"** & US-04 — Loading State**

**Acceptance Criteria:**

**Given** có ≥1 file trong danh sách chưa xử lý,

**When** nhấn nút “Xử lý tất cả”,

**Then** hiển loading spinner và progress bar; UI không bị block; lỗi 1 file không dừng các file khác; thông báo hoàn tất sau khi xong.

**Checklist Unit Test:**

- [ ]  isProcessing = true ngay sau khi nhấn nút, = false sau khi tất cả file xong

- [ ]  Progress bar value tăng từ 0 đến 100 theo số file đã xử lý

- [ ]  Nút “Xử lý tất cả” disabled trong khi đang process

- [ ]  Parallel processing: Promise.allSettled được dùng, không phải Promise.all (để tránh dừng khi 1 file lỗi)

- [ ]  Error isolation: mock 1 API call thất bại — các file khác vẫn xử lý thành công

- [ ]  Loading text hiển “Đang đọc hóa đơn...” đúng ngôn ngữ tiếng Việt

## 9.2  EPIC 2 — OCR & Trích Xuất Dữ Liệu

### US-07 — OCR trích xuất 12 trường

**Acceptance Criteria:**

**Given** hóa đơn chuẩn được upload,

**When** Claude Vision API trả về JSON,

**Then** parser tạo đúng typed object InvoiceData với ≥10/12 trường đầy đủ; không lỗi runtime; trường null được đánh dấu needs_review.

**Checklist Unit Test:**

- [ ]  parseOCRResponse(validJson) trả về InvoiceData đúng kiểu TypeScript

- [ ]  parseOCRResponse(missingFields) không throw, các trường thiếu = null

- [ ]  parseOCRResponse(invalidJson) throw ParseError với message rõ ràng

- [ ]  Số tiền: strừng “1.500.000” được parse đúng thành number 1500000

- [ ]  Ngày: “15/06/2024” và “2024-06-15” đều parse đúng thành Date object

- [ ]  VAT%: “10%” và “0.1” đều parse thành 10

- [ ]  12 trường bắt buộc đờu có trong InvoiceData type definition

### US-08 — Confidence score màu

**Acceptance Criteria:**

**Given** InvoiceData đã có confidence score cho từng trường,

**When** component ConfidenceBadge render,

**Then** xanh hiển khi ≥90%; vàng khi 60–89%; đỏ khi <60% hoặc null; % hiển bên cạnh badge.

**Checklist Unit Test:**

- [ ]  getConfidenceColor(95) === “green”, getConfidenceColor(75) === “yellow”, getConfidenceColor(50) === “red”

- [ ]  Boundary: getConfidenceColor(90) === “green”, getConfidenceColor(89) === “yellow”, getConfidenceColor(60) === “yellow”, getConfidenceColor(59) === “red”

- [ ]  getConfidenceColor(null) === “red”

- [ ]  ConfidenceBadge render đúng class CSS tương ứng với màu

- [ ]  Phần trăm hiển thị đúng giá trị truyền vào

### US-09 — Phát hiện hóa đơn trùng

**Acceptance Criteria:**

**Given** danh sách hóa đơn đã có invoice_number “HD-001” của NCC “Công ty A”,

**When** người dùng cố xác nhận hóa đơn mới có cùng invoice_number và vendor_name,

**Then** popup cảnh báo trùng hiện trước khi lưu; người dùng có thể bỏ qua hoặc từ chối.

**Checklist Unit Test:**

- [ ]  isDuplicate(newInvoice, existingList) === true khi trùng cả invoice_number và vendor_name

- [ ]  isDuplicate không sensitive: “HD-001” vs “hd-001” — so sánh case-insensitive

- [ ]  isDuplicate(newInvoice, emptyList) === false

- [ ]  isDuplicate khác invoice_number nhưng cùng vendor === false

- [ ]  isDuplicate cùng invoice_number nhưng khác vendor === false

- [ ]  Modal cảnh báo render khi isDuplicate === true, không render khi false

- [ ]  Chọn “Bỳ qua”: invoice vẫn được lưu; Chọn “Từ chối”: không lưu, modal đóng

### US-10 — Lưu localStorage

**Acceptance Criteria:**

**Given** người dùng đã xác nhận 3 hóa đơn,

**When** reload trang trình duyệt,

**Then** invoiceList được khôi phục đúng 3 hóa đơn; không mất dữ liệu; state xác nhận/từ chối được giữ nguyên.

**Checklist Unit Test:**

- [ ]  useLocalStorage hook: set(key, value) lưu đúng vào localStorage mock

- [ ]  useLocalStorage hook: get(key) trả về đúng giá trị đã lưu

- [ ]  useLocalStorage hook: get key không tồn tại trả về defaultValue

- [ ]  InvoiceData serialize/deserialize: JSON.stringify → JSON.parse giữ nguyên Date, number, string

- [ ]  Sau xác nhận: localStorage.getItem(“invoices”) chứa hóa đơn với status CONFIRMED

- [ ]  Sau từ chối: localStorage.getItem(“invoices”) chứa hóa đơn với status REJECTED

## 9.3  EPIC 3 — Review & Chỉnh Sửa

### US-11 — Layout 2 cột ảnh + form

**Acceptance Criteria:**

**Given** hóa đơn được chọn để review,

**When** component ReviewLayout render,

**Then** ảnh hiển trái, form hiển phải; scroll 2 cột độc lập; zoom ảnh được; layout không vỡ khi ảnh dọc/ngang.

**Checklist Unit Test:**

- [ ]  ReviewLayout render đúng 2 panel: image-panel và form-panel

- [ ]  Image viewer: zoom in/out thay đổi scale state đúng

- [ ]  Scroll event trên image panel không trigger scroll trên form panel

- [ ]  Snapshot với ảnh ngang (landscape) không vỡ layout

- [ ]  Snapshot với ảnh dọc (portrait) không vỡ layout

### US-12 — Inline editing

**Acceptance Criteria:**

**Given** người dùng xem form hóa đơn,

**When** click vào bất kỳ trường dữ liệu,

**Then** trường chuyển sang mode edit; nhấn Enter/Tab chuyển trường tiếp; blur tự động lưu; validation bắt lỗi ngay.

**Checklist Unit Test:**

- [ ]  EditableField: click chuyển isEditing = true, hiển input

- [ ]  EditableField: blur gọi onSave(newValue) với giá trị mới

- [ ]  EditableField: Escape key hủy sửa, khôi phục giá trị cũ

- [ ]  validateDate: “32/01/2024” invalid, “31/01/2024” valid

- [ ]  validateAmount: “abc” invalid, “1500000” valid, “-500” invalid

- [ ]  Tab navigation: focus tự động chuyển sang EditableField kế tiếp

### US-13 — Xác nhận / Từ chối

**Acceptance Criteria:**

**Given** người dùng đã review xong hóa đơn,

**When** nhấn nút Xác nhận hoặc Từ chối,

**Then** toast tiếng Việt hiển đúng màu; state cập nhật đúng; tự động chuyển sang hóa đơn tiếp theo.

**Checklist Unit Test:**

- [ ]  Xác nhận: invoiceStatus chuyển PENDING → CONFIRMED

- [ ]  Từ chối: invoiceStatus chuyển PENDING → REJECTED

- [ ]  Toast thông báo xác nhận: text tiếng Việt chứa “Xác nhận” và màu xanh

- [ ]  Toast thông báo từ chối: text tiếng Việt chứa “Từ chối” và màu đỏ

- [ ]  onNext() được gọi sau cả 2 action

- [ ]  Hóa đơn cuối danh sách: onNext() đưa về trạng thái không có hóa đơn tiếp theo (không lỗi index out of bounds)

## 9.4  EPIC 4 — Bảng Dữ Liệu & Xuất File

### US-15 — Bảng tổng hợp & US-16 — Bộ lịc

**Acceptance Criteria:**

**Given** danh sách hóa đơn đã xác nhận,

**When** người dùng mở tab Bảng Tổng Hợp,

**Then** bảng hiển đủ 8 cột đúng spec; phân trang 20 dòng; 3 filter hoạt động độc lập và kết hợp.

**Checklist Unit Test:**

- [ ]  filterByMonth(invoices, “2024-06”) chỉ trả về hóa đơn tháng 6/2024

- [ ]  filterByVendor(invoices, “cong ty”) tîm kiếm case-insensitive, không phân biệt dấu

- [ ]  filterByStatus(invoices, “CONFIRMED”) chỉ trả CONFIRMED

- [ ]  Kết hợp 3 filter: kết quả là giao của 3 bộ lịc

- [ ]  paginateInvoices(list, page=2, size=20) trả đúng dải [20..39]

- [ ]  Bảng rỗng (0 dòng): không throw, hiển empty state message

- [ ]  Cộ STT tự động đánh số đúng sau khi filter

### US-17 — Xuất Excel

**Acceptance Criteria:**

**Given** bảng hiển thị danh sách hóa đơn,

**When** nhấn nút Xuất Excel,

**Then** file .xlsx download được; ngày dạng DD/MM/YYYY; số tiền không ký tự đặc biệt; tên cột tiếng Việt đúng chuẩn.

**Checklist Unit Test:**

- [ ]  formatDateForExcel(new Date(“2024-06-15”)) === “15/06/2024”

- [ ]  formatAmountForExcel(1500000) === 1500000 (number, không phải string)

- [ ]  mapToWorksheetRow(invoice) trả về object có đú 8 key tiếng Việt

- [ ]  generateExcelBuffer(invoices) trả về ArrayBuffer không rỗng

- [ ]  Tên cột: “Ngày”, “Số Hôa Đơn”, “Nhà Cung Cấp”, “Mã Thuế”, “Tổng Tiền”, “VAT”, “Tổng Sau Thuế”, “Trạng Thái” đúng chính tả

- [ ]  Export 0 hóa đơn: file vẫn tạo được với dòng header

### US-18 — Tổng cuối bảng

**Acceptance Criteria:**

**Given** bảng đang hiển thị danh sách hóa đơn,

**When** người dùng thêm hoặc thay đổi filter,

**Then** dòng tổng cộng cập nhật đúng số liệu các hóa đơn đang hiển thị.

**Checklist Unit Test:**

- [ ]  calculateTotal(invoices).total === tổng thành tiền chính xác

- [ ]  calculateTotal(invoices).vat === tổng VAT chính xác

- [ ]  calculateTotal([]) === { total: 0, vat: 0 }

- [ ]  formatVND(1500000) === “1.500.000” (có dấu chấm phân cách hàng ngàn)

- [ ]  Tổng cập nhật realtime: mock filter thay đổi → calculateTotal được gọi lại với data mới

## 9.5  EPIC 5 — Dashboard & Tổng Quan

### US-19, US-20, US-21 — Widget, Biểu đồ & Danh sách cần review

**Acceptance Criteria:**

**Given** người dùng mở Dashboard,

**When** component Dashboard render,

**Then** 4 widget hiển đúng số liệu; bar chart hiển 4 tuần gần nhất; list 5 hóa đơn needs_review top ủu.

**Checklist Unit Test:**

- [ ]  countTodayInvoices(invoices, today) đếm đúng số hóa đơn ngày hôm nay

- [ ]  countMonthInvoices(invoices, currentMonth) đếm đúng tháng hiện tại

- [ ]  getWeeklyChartData(invoices) trả về array 4 phần tử với đúng { week, total }

- [ ]  getWeeklyChartData với invoices rỗng trả về 4 phần tử có total = 0

- [ ]  getNeedsReviewList(invoices, 5) chỉ trả tối đa 5 hóa đơn có needs_review = true

- [ ]  getNeedsReviewList sắp xếp theo confidence tăng dần (thấp nhất lên trước)

## 9.6  EPIC 6 — Trải Nghiệm Mobile

### US-22 — Mobile camera upload

**Acceptance Criteria:**

**Given** người dùng mở app trên điện thoại,

**When** nhấn nút camera upload,

**Then** dialog chọn nguồn ảnh mở ra; chụp ảnh trực tiếp upload được; preview hiển đú lớn trên màn hình nhỳ.

**Checklist Unit Test:**

- [ ]  MobileCameraInput: input element có attribute accept=“image/*” và capture=“camera”

- [ ]  onChange handler gọi onFileSelected(file) với File object đúng

- [ ]  Preview: src = URL.createObjectURL(file) được set đúng

- [ ]  Button touch target: computed min-height ≥ 44px (WCAG AA)

- [ ]  Preview width = 100% trên viewport 375px

## 9.7  Checklist Review Tổng Quát — Áp Dụng Cho Tất Cả Unit Test

**A. Cấu trúc & Tổ chức Test**

- [ ]  Mỗi file test có từ “.test.ts” hoặc “.spec.ts”; đặt cùng thư mục với file đang test

- [ ]  describe block có tên rõ ràng: tên component/function đang test

- [ ]  Tên test theo format “should [hành vi] when [điều kiện]” hoặc tiếng Việt tương đường

- [ ]  Mỗi test kiểm tra đúng 1 hành vi (Single Responsibility)

- [ ]  Không có logic phức tạp trong test; setup được tách vào beforeEach/helper

**B. Coverage & Chất Lượng**

- [ ]  Coverage ≥80% cho tất cả function xử lý OCR response (yêu cầu DoD)

- [ ]  Coverage ≥70% cho các utility function: format, validate, calculate

- [ ]  Happy path: test với data chuẩn có kết quả đúng

- [ ]  Sad path: test với data sai, null, rỗng, vượt giới hạn

- [ ]  Boundary value: test ngưỡng giá trị biên (0, 1, max, max+1)

- [ ]  Không có test nào phụ thuộc vào thứ tự chạy (isolated)

**C. Mock & Stub**

- [ ]  API call (Claude Vision) được mock; không gọi API thực trong unit test

- [ ]  localStorage được mock bằng jest.spyOn(Storage.prototype)

- [ ]  Date.now() / new Date() được mock khi test logic phụ thuộc thời gian

- [ ]  Mock được reset trong afterEach để tránh lực nhiễm giữa các test

- [ ]  Type fixture: có file fixtures/invoiceMock.ts chứa InvoiceData mẫu đú 12 trường

**D. React Component Test (Testing Library)**

- [ ]  Dùng @testing-library/react; không test implementation details

- [ ]  Query ưu tiên: getByRole > getByLabelText > getByText > getByTestId

- [ ]  User event dùng @testing-library/user-event chính xác (userEvent.click, userEvent.type)

- [ ]  Async: dùng waitFor() hoặc findBy* cho các thành phần bất đồng bộ

- [ ]  Snapshot test: chỉ dùng cho UI ổn định; không snapshot cả trang

**E. Performance & Ổn Định**

- [ ]  Mỗi unit test chạy xong trong <200ms

- [ ]  Không có setTimeout thực trong test; dùng jest.useFakeTimers()

- [ ]  Không có console.error khi chạy đúng happy path

- [ ]  CI pipeline chạy toàn bộ test suite không có flaky test

- [ ]  Test report (coverage) được generate và được review trước khi merge vào main

# 10. RISK REGISTER

Bảng dưới đây liệt kê các rủi ro chính được xác định cho dự án Invoice OCR Tool, kèm mức độ ảnh hưởng, xác suất xảy ra, và kế hoạch giảm thiểu.

| **#** | **Rủi ro** | **Loại** | **Xác suất** | **Mức độ** | **RPN** | **Kế hoạch giảm thiểu** | **Owner** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-01 | OCR accuracy thấp với hóa đơn mờ / viết tay | Kỹ thuật | Cao | Cao | 9 | Thêm confidence threshold; tự động đánh dấu needs_review khi <60%; bổ sung preprocessing ảnh (sharpen, deskew) | Mark |
| R-02 | Chi phí API Claude Vision vượt ngân sách | Chi phí | Trung bình | Cao | 6 | Đặt rate limit theo user/ngày; cache kết quả OCR; monitor cost dashboard hàng tuần; alert khi cost >80% budget tháng | PM |
| R-03 | API Claude Vision gián đoạn (downtime) | Kỹ thuật | Thấp | Cao | 3 | Retry với exponential backoff (3 lần); queue offline; thông báo rõ khi API không khả dụng | Mark |
| R-04 | Dữ liệu hóa đơn nhạy cảm bị rò rỉ | Bảo mật | Thấp | Rất cao | 5 | Không lưu ảnh hóa đơn lên server; xử lý client-side; mã hóa localStorage; HTTPS bắt buộc | Trung Lê Hải |
| R-05 | Người dùng mới không biết cách sử dụng | UX | Cao | Trung bình | 6 | Thêm onboarding flow (Sprint 5); tooltip hướng dẫn; video demo ngắn; tài liệu help trong app | Sophia |
| R-06 | Không tìm được hóa đơn cũ khi cần đối soát | Tính năng | Cao | Cao | 9 | Xây dựng tính năng tìm kiếm fulltext (Sprint 4); search theo số HĐ, NCC, ngày, số tiền | Tuấn Vũ |
| R-07 | Chi phí tháng vượt ngân sách mà không biết | Tài chính | Trung bình | Cao | 6 | Cảnh báo ngân sách tháng khi đạt 80% và 100% ngưỡng; widget hiển thị % ngân sách đã dùng trên Dashboard | Mark |
| R-08 | Không thể xuất báo cáo cho kiểm toán / sếp | Tính năng | Cao | Cao | 9 | Thêm xuất báo cáo PDF (Sprint 4); layout chuyên nghiệp; tóm tắt tổng hợp kèm biểu đồ | Tuấn Vũ |
| R-09 | Phân trang / hiệu năng chậm khi >500 HĐ | Kỹ thuật | Trung bình | Trung bình | 4 | Virtual scrolling; pagination server-side khi cần; index localStorage theo tháng | Trung Lê Hải |
| R-10 | Hóa đơn PDF nhiều trang xử lý sai trang | Kỹ thuật | Trung bình | Trung bình | 4 | Chỉ OCR trang 1 mặc định; cho phép chọn trang; hiển thumbnail trang để user xác nhận | Mark |

Chú thích RPN (Risk Priority Number) = Xác suất × Mức độ (thang 1–3). RPN ≥6 cần kế hoạch giảm thiểu tích cực ngay trong sprint kế tiếp.

# 11. USER STORIES BỔ SUNG (EPIC 7–10)

Bốn EPIC mới được bổ sung vào Product Backlog dựa trên phân tích Risk Register và phản hồi từ người dùng. Tổng cộng 17 User Stories mới, 79 Story Points bổ sung.

## EPIC 7 — Tìm Kiếm Hóa Đơn

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** | **Sprint** |
| --- | --- | --- | --- | --- | --- |
| US-24 | Là kế toán, tôi muốn tìm hóa đơn theo số HĐ để đối soát nhanh khi sếp hỏi | Ô tìm kiếm nổi bật trên bảng; tìm realtime khi gõ; highlight từ khóa trong kết quả; không phân biệt dấu tiếng Việt | Must Have | 5 | Sprint 4 |
| US-25 | Là kế toán, tôi muốn tìm hóa đơn theo tên nhà cung cấp để xem lịch sử giao dịch | Search NCC case-insensitive; hỗ trợ tên viết tắt; kết quả hiển trong <500ms; số lượng kết quả rõ ràng | Must Have | 3 | Sprint 4 |
| US-26 | Là kế toán, tôi muốn tìm hóa đơn theo khoảng số tiền để kiểm soát chi phí lớn | Bộ lọc Từ–Đến số tiền; validate số âm; kết hợp với filter tháng/NCC; clear filter riêng lẻ | Should Have | 5 | Sprint 4 |
| US-27 | Là kế toán, tôi muốn tìm kiếm toàn văn trên tất cả trường để không bỏ sót khi không nhớ rõ | Full-text search trên 8 trường; sắp xếp kết quả theo độ liên quan; hiển thị trường nào khớp; export kết quả tìm kiếm | Could Have | 8 | Sprint 5 |

## EPIC 8 — Cảnh Báo Ngân Sách Tháng

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** | **Sprint** |
| --- | --- | --- | --- | --- | --- |
| US-28 | Là kế toán, tôi muốn thiết lập ngưỡng ngân sách tháng để kiểm soát chi phí của công ty | Form nhập ngân sách tháng (VND); lưu vào localStorage; hiển thị % đã sử dụng trên Dashboard; cập nhật realtime | Must Have | 3 | Sprint 4 |
| US-29 | Là kế toán, tôi muốn nhận cảnh báo khi chi phí tháng đạt 80% ngân sách để chủ động báo cáo sếp | Toast cảnh báo màu vàng khi ≥80%; không spam (hiện 1 lần/ngày); badge vàng trên widget ngân sách; dismiss được | Must Have | 5 | Sprint 4 |
| US-30 | Là kế toán, tôi muốn nhận cảnh báo đỏ khi vượt ngân sách để có hành động kịp thời | Toast cảnh báo màu đỏ khi ≥100%; badge đỏ nổi bật; ghi log ngày vượt ngân sách; hiển tổng vượt bao nhiêu | Must Have | 3 | Sprint 4 |
| US-31 | Là kế toán, tôi muốn xem lịch sử chi phí so với ngân sách 6 tháng để phân tích xu hướng | Biểu đồ line chart 6 tháng: đường chi phí vs đường ngân sách; tooltip chi tiết; export PNG | Should Have | 5 | Sprint 5 |

## EPIC 9 — Xuất Báo Cáo PDF

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** | **Sprint** |
| --- | --- | --- | --- | --- | --- |
| US-32 | Là kế toán, tôi muốn xuất báo cáo PDF tổng hợp hóa đơn tháng để nộp cho sếp | PDF theo template công ty; có logo (placeholder); bảng danh sách HĐ; tổng hợp cuối trang; số trang; download 1 click | Must Have | 8 | Sprint 4 |
| US-33 | Là kế toán, tôi muốn báo cáo PDF có biểu đồ chi phí để trình bày trực quan hơn | Bar chart chi phí theo tuần; pie chart theo nhà cung cấp top 5; màu sắc nhất quán với app; chú thích rõ ràng | Should Have | 5 | Sprint 4 |
| US-34 | Là kế toán, tôi muốn chọn khoảng thời gian khi xuất PDF để linh hoạt theo nhu cầu báo cáo | Date range picker Từ–Đến; preset: tháng này, quý này, tùy chỉnh; preview số HĐ sẽ xuất trước khi tải | Should Have | 5 | Sprint 5 |
| US-35 | Là kế toán, tôi muốn xuất PDF tóm tắt 1 hóa đơn cụ thể để đính kèm email khi cần xác nhận | PDF 1 trang cho 1 HĐ; đủ 12 trường; ảnh hóa đơn gốc nhỏ phía dưới; watermark “ĐÃ XÁC NHẬN” | Could Have | 5 | Sprint 5 |

## EPIC 10 — Onboarding Người Dùng Mới

| **ID** | **User Story** | **Acceptance Criteria** | **Priority** | **Points** | **Sprint** |
| --- | --- | --- | --- | --- | --- |
| US-36 | Là người dùng mới, tôi muốn thấy màn hình chào với hướng dẫn 3 bước để biết bắt đầu từ đâu | Welcome screen lần đầu mở app; 3 bước: Upload → OCR → Xuất; nút “Bắt đầu ngay” rõ ràng; có thể bỏ qua | Must Have | 3 | Sprint 5 |
| US-37 | Là người dùng mới, tôi muốn có tooltip hướng dẫn tại chỗ để hiểu chức năng mà không cần đọc tài liệu | Tooltip xuất hiện lần đầu trên: UploadZone, nút Xử lý, bảng Review, nút Xuất; có thể tắt toàn bộ; không hiện lại lần sau | Must Have | 5 | Sprint 5 |
| US-38 | Là người dùng mới, tôi muốn thử với hóa đơn mẫu để hiểu luồng trước khi dùng hóa đơn thật | Nút “Dùng hóa đơn mẫu” trên Welcome screen; hóa đơn demo sẵn có; kết quả OCR pre-filled; badge “Demo” rõ ràng | Must Have | 3 | Sprint 5 |
| US-39 | Là người dùng mới, tôi muốn xem video hướng dẫn ngắn để học nhanh nhất | Link video YouTube 2 phút nội app; thumbnail preview; mở trong modal không rời trang; có phụ đề tiếng Việt | Should Have | 3 | Sprint 5 |
| US-40 | Là người dùng mới, tôi muốn có màn hình Help/FAQ để tự giải quyết khi gặp vấn đề | Trang Help với 10 câu hỏi thường gặp; search trong FAQ; link báo lỗi; email hỗ trợ rõ ràng | Should Have | 5 | Sprint 5 |

# 12. PRODUCT BACKLOG ĐẦY ĐỦ (40 User Stories)

Bảng tổng hợp toàn bộ 40 User Stories bao gồm 23 stories gốc (Sprint 1–3) và 17 stories bổ sung (Sprint 4–5). Tổng: 162 Story Points.

| **ID** | **EPIC** | **Mô tả ngắn** | **Priority** | **Points** | **Sprint** | **Mới?** |
| --- | --- | --- | --- | --- | --- | --- |
| US-01 | EPIC 1 | Upload drag & drop nhiều file | Must Have | 3 | Sprint 1 |  |
| US-02 | EPIC 1 | Preview thumbnail sau upload | Must Have | 2 | Sprint 1 |  |
| US-03 | EPIC 1 | Nút Xử lý tất cả | Must Have | 3 | Sprint 1 |  |
| US-04 | EPIC 1 | Loading state OCR | Must Have | 2 | Sprint 1 |  |
| US-07 | EPIC 2 | OCR trích xuất 12 trường | Must Have | 8 | Sprint 1 |  |
| US-08 | EPIC 2 | Confidence score màu | Must Have | 3 | Sprint 1 |  |
| US-10 | EPIC 2 | Lưu localStorage | Must Have | 3 | Sprint 1 |  |
| US-11 | EPIC 3 | Layout 2 cột ảnh + form | Must Have | 5 | Sprint 2 |  |
| US-12 | EPIC 3 | Inline editing | Must Have | 3 | Sprint 2 |  |
| US-13 | EPIC 3 | Nút Xác nhận / Từ chối | Must Have | 2 | Sprint 2 |  |
| US-09 | EPIC 2 | Phát hiện hóa đơn trùng | Must Have | 5 | Sprint 2 |  |
| US-15 | EPIC 4 | Bảng tổng hợp | Must Have | 3 | Sprint 2 |  |
| US-16 | EPIC 4 | Bộ lọc tháng/NCC/trạng thái | Must Have | 3 | Sprint 2 |  |
| US-17 | EPIC 4 | Xuất Excel | Must Have | 5 | Sprint 2 |  |
| US-18 | EPIC 4 | Tổng cuối bảng | Must Have | 2 | Sprint 2 |  |
| US-19 | EPIC 5 | Widget tổng quan dashboard | Should Have | 2 | Sprint 3 |  |
| US-20 | EPIC 5 | Biểu đồ chi phí theo tuần | Should Have | 3 | Sprint 3 |  |
| US-21 | EPIC 5 | List HĐ cần review dashboard | Should Have | 2 | Sprint 3 |  |
| US-14 | EPIC 3 | Badge + filter needs_review | Should Have | 3 | Sprint 3 |  |
| US-22 | EPIC 6 | Mobile camera upload | Should Have | 3 | Sprint 3 |  |
| US-05 | EPIC 1 | Xử lý ảnh nghiêng/nhoè | Should Have | 5 | Sprint 3 |  |
| US-06 | EPIC 1 | Nhận diện chữ viết tay | Could Have | 8 | Sprint 3 |  |
| US-23 | EPIC 6 | Giao diện mobile responsive | Could Have | 5 | Sprint 3 |  |
| US-24 | EPIC 7 | Tìm kiếm theo số HĐ | Must Have | 5 | Sprint 4 | **★ Mới** |
| US-25 | EPIC 7 | Tìm kiếm theo NCC | Must Have | 3 | Sprint 4 | **★ Mới** |
| US-26 | EPIC 7 | Lọc theo khoảng số tiền | Should Have | 5 | Sprint 4 | **★ Mới** |
| US-28 | EPIC 8 | Thiết lập ngân sách tháng | Must Have | 3 | Sprint 4 | **★ Mới** |
| US-29 | EPIC 8 | Cảnh báo 80% ngân sách | Must Have | 5 | Sprint 4 | **★ Mới** |
| US-30 | EPIC 8 | Cảnh báo vượt 100% ngân sách | Must Have | 3 | Sprint 4 | **★ Mới** |
| US-32 | EPIC 9 | Xuất báo cáo PDF tổng hợp tháng | Must Have | 8 | Sprint 4 | **★ Mới** |
| US-33 | EPIC 9 | PDF có biểu đồ chi phí | Should Have | 5 | Sprint 4 | **★ Mới** |
| US-27 | EPIC 7 | Tìm kiếm toàn văn | Could Have | 8 | Sprint 5 | **★ Mới** |
| US-31 | EPIC 8 | Lịch sử ngân sách 6 tháng | Should Have | 5 | Sprint 5 | **★ Mới** |
| US-34 | EPIC 9 | Chọn khoảng thời gian xuất PDF | Should Have | 5 | Sprint 5 | **★ Mới** |
| US-35 | EPIC 9 | Xuất PDF 1 hóa đơn | Could Have | 5 | Sprint 5 | **★ Mới** |
| US-36 | EPIC 10 | Welcome screen 3 bước | Must Have | 3 | Sprint 5 | **★ Mới** |
| US-37 | EPIC 10 | Tooltip onboarding tại chỗ | Must Have | 5 | Sprint 5 | **★ Mới** |
| US-38 | EPIC 10 | Hóa đơn mẫu demo | Must Have | 3 | Sprint 5 | **★ Mới** |
| US-39 | EPIC 10 | Video hướng dẫn | Should Have | 3 | Sprint 5 | **★ Mới** |
| US-40 | EPIC 10 | Trang Help / FAQ | Should Have | 5 | Sprint 5 | **★ Mới** |
|  |  | **TỔNG CỘNG** |  | **162 SP** | **5 Sprints** | **38 Stories** |

# 13. SPRINT 4 — Tìm Kiếm, Ngân Sách & Xuất PDF

| **Sprint** | **Sprint 4** |
| --- | --- |
| **Mục tiêu** | Người dùng có thể tìm kiếm hóa đơn nhanh, nhận cảnh báo khi sắp vượt ngân sách, và xuất báo cáo PDF chuyên nghiệp cho sếp |
| **Story Points** | 37 SP |
| **User Stories** | US-24, US-25, US-26, US-28, US-29, US-30, US-32, US-33 |

## Sprint 4 Backlog

| **ID** | **Story** | **Dev Tasks** | **Points** | **Owner** |
| --- | --- | --- | --- | --- |
| US-24 | Tìm kiếm theo số HĐ | SearchBar component; debounce 300ms; highlight kết quả; filter state; URL params cho share link | 5 SP | Tuấn Vũ |
| US-25 | Tìm kiếm theo NCC | Tích hợp vào SearchBar; normalize tên (bỏ dấu, lowercase); dropdown suggest NCC có sẵn | 3 SP | Tuấn Vũ |
| US-26 | Lọc theo khoảng tiền | RangeInput component (Từ–Đến); validate Từ ≤ Đến; kết hợp filter; preset range phổ biến | 5 SP | Tuấn Vũ |
| US-28 | Thiết lập ngân sách tháng | BudgetSettingsModal; form VND input; persist localStorage; widget % ngân sách trên Dashboard | 3 SP | Mark |
| US-29 | Cảnh báo 80% ngân sách | useBudgetAlert hook; logic so sánh chi phí vs ngân sách; toast vàng; throttle 1 lần/ngày | 5 SP | Mark |
| US-30 | Cảnh báo vượt 100% | Toast đỏ; badge nổi bật widget; log ngày vượt; hiển tổng vượt bao nhiêu VND | 3 SP | Mark |
| US-32 | Xuất PDF tổng hợp tháng | jsPDF/html2canvas; ReportTemplate component; logo placeholder; bảng HĐ; footer số trang; download button | 8 SP | Sophia |
| US-33 | PDF có biểu đồ | Render Recharts sang canvas; embed canvas vào PDF; pie chart NCC top 5; bar chart theo tuần | 5 SP | Sophia |

### Sprint 4 — Definition of Done (DoD)

| **#** | **User Story** | **Definition of Done** |
| --- | --- | --- |
| 1 | US-24 | Tìm theo số HĐ ra đúng kết quả; kết quả highlight; không kết quả hiện empty state; tìm không phân biệt dấu tiếng Việt |
| 2 | US-25 | Tìm tên NCC viết hoa/thường/thiếu dấu đều ra kết quả; dropdown suggest hiện đúng danh sách NCC hiện có |
| 3 | US-26 | Filter khoảng tiền hoạt động độc lập và kết hợp với filter tháng/NCC; validate Từ không lớn hơn Đến |
| 4 | US-28 | Nhập ngân sách lưu được; widget Dashboard hiển đúng %; reset ngân sách về 0 hoạt động |
| 5 | US-29 | Toast vàng xuất hiện đúng khi ≥80%; không xuất hiện lại trong cùng ngày; dismiss lưu trạng thái |
| 6 | US-30 | Toast đỏ và badge nổi bật khi ≥100%; tổng vượt hiển đúng số VND; log timestamp |
| 7 | US-32 | PDF download được trên Chrome/Firefox/Safari; bảng HĐ đầy đủ; số trang đúng; font tiếng Việt không lỗi |
| 8 | US-33 | Biểu đồ render đúng trong PDF (không bị blank); màu sắc nhất quán; chú thích dữ liệu đúng |

# 14. SPRINT 5 — Nâng Cao, PDF Chi Tiết & Onboarding

| **Sprint** | **Sprint 5** |
| --- | --- |
| **Mục tiêu** | Hoàn thiện trải nghiệm người dùng: tìm kiếm nâng cao, lịch sử ngân sách, PDF linh hoạt, và onboarding cho người dùng mới |
| **Story Points** | 34 SP |
| **User Stories** | US-27, US-31, US-34, US-35, US-36, US-37, US-38, US-39, US-40 |

## Sprint 5 Backlog

| **ID** | **Story** | **Dev Tasks** | **Points** | **Owner** |
| --- | --- | --- | --- | --- |
| US-27 | Tìm kiếm toàn văn | Full-text search engine (Fuse.js); index 8 trường; score relevance; highlight match trong tất cả cột; export kết quả | 8 SP | Tuấn Vũ |
| US-31 | Lịch sử ngân sách 6 tháng | Persist ngân sách từng tháng riêng; LineChart 6 điểm; tooltip VND; so sánh chi phí vs target | 5 SP | Mark |
| US-34 | Chọn khoảng thời gian PDF | DateRangePicker component; preset: tháng/quý/tùy chỉnh; preview count HĐ; pass range vào export engine | 5 SP | Sophia |
| US-35 | Xuất PDF 1 hóa đơn | SingleInvoicePDF template; 12 trường layout đẹp; thumbnail ảnh gốc nhỏ; watermark ĐÃ XÁC NHẬN | 5 SP | Sophia |
| US-36 | Welcome screen 3 bước | WelcomeModal component; hiển lần đầu (localStorage flag); 3 bước animation; nút Bắt đầu + Bỏ qua | 3 SP | Sophia |
| US-37 | Tooltip onboarding | useOnboarding hook; tour steps config; Popover highlight element; dismiss lưu flag; reset tour option | 5 SP | Sophia |
| US-38 | Hóa đơn mẫu demo | fixture/demo-invoice.json; nút Load Demo trên Welcome screen; badge DEMO trên card; xóa demo dễ dàng | 3 SP | Trung Lê Hải |
| US-39 | Video hướng dẫn | VideoModal component; YouTube embed; thumbnail preview; phụ đề tiếng Việt; link từ Help | 3 SP | Trung Lê Hải |
| US-40 | Trang Help / FAQ | HelpPage route; 10 FAQ accordion; SearchFAQ; email hỗ trợ; link báo lỗi GitHub Issues | 5 SP | Trung Lê Hải |

### Sprint 5 — Definition of Done (DoD)

| **#** | **User Story** | **Definition of Done** |
| --- | --- | --- |
| 1 | US-27 | Fuse.js tìm đúng kết quả với từ viết tắt, thiếu dấu; ranking đúng theo relevance; export Excel kết quả tìm kiếm hoạt động |
| 2 | US-31 | Chart hiển đúng 6 tháng gần nhất; các tháng chưa có dữ liệu hiện 0; tooltip VND format |
| 3 | US-34 | Date range picker chọn được tùy ý; preset 3 loại hoạt động; preview count đúng; PDF xuất đúng khoảng thời gian |
| 4 | US-35 | PDF 1 trang; 12 trường đủ và đúng; ảnh thumbnail không vỡ layout; watermark hiển rõ |
| 5 | US-36 | Welcome screen chỉ xuất hiện lần đầu; animation 3 bước mượt; Bỏ qua không hiện lại; Bắt đầu đưa thẳng đến upload |
| 6 | US-37 | Tour chạy đúng thứ tự 5 bước; highlight element đúng; Dismiss lưu flag; nút Reset Tour trong Settings |
| 7 | US-38 | Demo invoice load thành công; badge DEMO hiển rõ; Xóa demo sạch khỏi localStorage |
| 8 | US-39 | Video modal mở đúng; YouTube không autoplay; đóng modal dừng video; phụ đề tiếng Việt bật được |
| 9 | US-40 | 10 FAQ đúng nội dung; search FAQ ra kết quả liên quan; email hỗ trợ đúng địa chỉ; không có broken link |

# 15. TỔNG QUAN 5 SPRINT (CẬP NHẬT)

| **Sprint** | **Mục tiêu chính** | **Story Points** | **User Stories** |
| --- | --- | --- | --- |
| **Sprint 1** | Nền tảng Upload & OCR — người dùng upload và nhận dữ liệu tự động | 24 SP | US-01, 02, 03, 04, 07, 08, 10 |
| **Sprint 2** | Review & Xuất File — hoàn thiện luồng review và xuất dữ liệu ra Excel | 28 SP | US-09, 11, 12, 13, 15, 16, 17, 18 |
| **Sprint 3** | Dashboard & Mobile — tổng quan, trải nghiệm mobile, nâng cao OCR | 34 SP | US-05, 06, 14, 19, 20, 21, 22, 23 |
| **Sprint 4** | Tìm Kiếm, Ngân Sách & Xuất PDF — tính năng nâng cao theo Risk Register | 37 SP | US-24, 25, 26, 28, 29, 30, 32, 33 |
| **Sprint 5** | Nâng Cao & Onboarding — hoàn thiện sản phẩm, trải nghiệm người dùng mới | 34 SP | US-27, 31, 34, 35, 36, 37, 38, 39, 40 |
| **TỔNG** |  | **162 SP** | **40 User Stories** |

# 16. ACCEPTANCE CRITERIA & CHECKLIST UNIT TEST — EPIC 7–10

Phần này bổ sung Acceptance Criteria (chuẩn Given–When–Then) và Checklist Unit Test cho toàn bộ 17 User Stories thuộc EPIC 7–10. Áp dụng cùng bộ DoD chung đã định nghĩa ở Section 9.7.

## 16.1  EPIC 7 — Tìm Kiếm Hóa Đơn

### US-24 — Tìm kiếm theo số hóa đơn

**Acceptance Criteria:**

**Given** danh sách hóa đơn đã có dữ liệu,

**When** người dùng gõ số HĐ vào ô tìm kiếm,

**Then** kết quả lọc realtime trong vòng 300ms; từ khóa được highlight trong kết quả; không phân biệt dấu tiếng Việt và hoa/thường; khi không có kết quả hiện empty state rõ ràng.

**Checklist Unit Test:**

- [ ]  searchByInvoiceNumber('HD-001', list) trả về đúng hóa đơn có số HD-001

- [ ]  searchByInvoiceNumber('hd-001', list) trả về kết quả (case-insensitive)

- [ ]  searchByInvoiceNumber('HD 001', list) so sánh sau khi normalize khoảng trắng

- [ ]  searchByInvoiceNumber('', list) trả về toàn bộ danh sách (không filter)

- [ ]  searchByInvoiceNumber('NOTEXIST', list) trả về mảng rỗng []

- [ ]  Debounce: gõ 5 ký tự liên tiếp chỉ trigger search 1 lần sau 300ms (jest.useFakeTimers)

- [ ]  Highlight: kết quả render đúng tag highlight bao quanh từ khóa khớp

- [ ]  Empty state: component hiển thị khi searchResult.length === 0

### US-25 — Tìm kiếm theo tên nhà cung cấp

**Acceptance Criteria:**

**Given** danh sách hóa đơn từ nhiều NCC khác nhau,

**When** người dùng gõ tên hoặc viết tắt tên NCC vào ô tìm kiếm,

**Then** kết quả hiển tất cả hóa đơn của NCC khớp; search không phân biệt dấu ("cong ty" ra "Công Ty"); dropdown suggest danh sách NCC có sẵn; hiện số lượng kết quả.

**Checklist Unit Test:**

- [ ]  searchByVendor('cong ty a', list) khớp với vendor_name 'Công Ty A' (normalize dấu)

- [ ]  searchByVendor('CONG TY', list) khớp case-insensitive

- [ ]  searchByVendor('ct a', list) không trả về kết quả (không match partial viết tắt trừ khi config)

- [ ]  getVendorSuggestions(list) trả về mảng unique tên NCC từ list hiện có

- [ ]  getVendorSuggestions([]) trả về []

- [ ]  normalizeVietnamese('Công Ty') === 'cong ty' (helper function test)

- [ ]  ResultCount: component hiển thị đúng số lượng kết quả (vd: '3 hóa đơn')

- [ ]  Kết hợp: searchByVendor + filterByMonth hoạt động đúng (giao của 2 tập kết quả)

### US-26 — Lọc theo khoảng số tiền

**Acceptance Criteria:**

**Given** người dùng mở bộ lọc nâng cao,

**When** nhập khoảng tiền Từ và Đến (VND),

**Then** chỉ hiển hóa đơn có tổng tiền trong khoảng [Từ, Đến]; validate Từ không lớn hơn Đến; nhập số âm bị từ chối; kết hợp được với filter tháng và NCC.

**Checklist Unit Test:**

- [ ]  filterByAmountRange(list, 1000000, 5000000) chỉ trả HĐ có total_amount trong [1M, 5M]

- [ ]  filterByAmountRange(list, 5000000, 1000000) throw ValidationError (Từ > Đến)

- [ ]  filterByAmountRange(list, -100, 5000000) throw ValidationError (số âm)

- [ ]  filterByAmountRange(list, 0, Infinity) trả toàn bộ danh sách

- [ ]  filterByAmountRange(list, 1000000, 1000000) trả HĐ có total_amount === 1000000 (boundary)

- [ ]  Kết hợp: filterByAmountRange + filterByMonth + searchByVendor cho kết quả là giao 3 bộ

- [ ]  validateAmountRange(5000, 3000) trả error message tiếng Việt rõ ràng

- [ ]  Input: nhập ký tự chữ vào ô số tiền bị block, chỉ cho phép số

### US-27 — Tìm kiếm toàn văn (full-text)

**Acceptance Criteria:**

**Given** người dùng gõ từ khóa bất kỳ vào ô full-text search,

**When** hệ thống tìm trên tất cả 8 trường của hóa đơn (số HĐ, NCC, MST, hàng hóa, ghi chú...),

**Then** kết quả sắp xếp theo độ liên quan (relevance score); mỗi kết quả hiện trường nào khớp; có thể export kết quả tìm kiếm ra Excel.

**Checklist Unit Test:**

- [ ]  fullTextSearch('VAT', list) khớp hóa đơn chứa 'VAT' ở bất kỳ trường nào

- [ ]  fullTextSearch('máy tính', list) tìm trong trường hàng hóa/ghi chú

- [ ]  fullTextSearch('', list) trả toàn bộ danh sách không filter

- [ ]  Fuse.js config: threshold ≤ 0.4; keys đúng 8 trường; includeMatches: true

- [ ]  Relevance sort: kết quả khớp nhiều trường hơn xếp trước

- [ ]  getMatchedFields(result) trả array tên các trường có từ khóa khớp

- [ ]  exportSearchResults(results) tạo file xlsx đúng với chỉ các hàng trong kết quả

- [ ]  Performance: fullTextSearch trên 500 HĐ hoàn thành trong <100ms

## 16.2  EPIC 8 — Cảnh Báo Ngân Sách Tháng

### US-28 — Thiết lập ngân sách tháng

**Acceptance Criteria:**

**Given** người dùng mở Settings hoặc widget ngân sách,

**When** nhập số tiền ngân sách tháng (VND) và lưu,

**Then** giá trị được lưu vào localStorage; widget Dashboard hiển thị % chi phí đã dùng so với ngân sách; cập nhật realtime khi có hóa đơn mới được xác nhận.

**Checklist Unit Test:**

- [ ]  setBudget(50000000) lưu đúng vào localStorage key 'budget_current_month'

- [ ]  getBudget() trả về 50000000 sau khi set

- [ ]  getBudget() trả về null khi chưa thiết lập (key không tồn tại)

- [ ]  calculateBudgetUsage(totalSpent, budget) trả về % đúng (vd: 40000000/50000000 = 80%)

- [ ]  calculateBudgetUsage(0, 50000000) === 0

- [ ]  calculateBudgetUsage(60000000, 50000000) === 120 (vượt ngân sách)

- [ ]  BudgetWidget: hiển đúng % và số tiền còn lại; cập nhật khi invoiceList thay đổi

- [ ]  setBudget(0) hoặc setBudget(-1) throw ValidationError

### US-29 — Cảnh báo khi đạt 80% ngân sách

**Acceptance Criteria:**

**Given** ngân sách tháng đã được thiết lập và chi phí tháng đạt ≥80% ngưỡng,

**When** người dùng mở app hoặc xác nhận thêm hóa đơn,

**Then** toast cảnh báo màu vàng xuất hiện với nội dung tiếng Việt rõ ràng; chỉ xuất hiện tối đa 1 lần/ngày dù reload nhiều lần; người dùng có thể dismiss.

**Checklist Unit Test:**

- [ ]  useBudgetAlert: shouldShowAlert(80, lastAlertDate=today) === false (đã alert hôm nay)

- [ ]  useBudgetAlert: shouldShowAlert(80, lastAlertDate=yesterday) === true

- [ ]  useBudgetAlert: shouldShowAlert(79, lastAlertDate=null) === false (chưa đến 80%)

- [ ]  useBudgetAlert: shouldShowAlert(80, lastAlertDate=null) === true

- [ ]  useBudgetAlert: shouldShowAlert(100, lastAlertDate=null) === true (vẫn trigger)

- [ ]  Toast màu vàng render khi usage ≥ 80%; toast màu đỏ khi usage ≥ 100%

- [ ]  Sau dismiss: localStorage lưu lastBudgetAlertDate = today

- [ ]  Throttle: mock Date.now() 2 lần trong cùng ngày — alert chỉ hiện 1 lần

### US-30 — Cảnh báo vượt 100% ngân sách

**Acceptance Criteria:**

**Given** chi phí tháng vượt quá 100% ngân sách đã thiết lập,

**When** người dùng xác nhận thêm hóa đơn hoặc mở app,

**Then** toast đỏ nổi bật hiện tổng số tiền đã vượt (VND); badge đỏ trên widget ngân sách; ghi log ngày và số tiền vượt vào localStorage.

**Checklist Unit Test:**

- [ ]  isOverBudget(110) === true; isOverBudget(100) === true; isOverBudget(99) === false

- [ ]  calculateOverAmount(spent=55M, budget=50M) === 5000000

- [ ]  calculateOverAmount(spent=40M, budget=50M) === 0 (không vượt)

- [ ]  logBudgetOverrun(date, overAmount) lưu đúng vào localStorage 'budget_overrun_log'

- [ ]  getBudgetOverrunLog() trả về array log theo thứ tự thời gian

- [ ]  Toast đỏ: text chứa số tiền vượt định dạng VND đúng

- [ ]  Badge widget: className chứa 'danger' hoặc 'red' khi usage ≥ 100%

- [ ]  Kết hợp US-29 + US-30: usage=85% → toast vàng; usage=105% → toast đỏ (không toast vàng đồng thời)

### US-31 — Lịch sử chi phí so với ngân sách 6 tháng

**Acceptance Criteria:**

**Given** người dùng mở Dashboard hoặc trang Báo cáo,

**When** hệ thống tính chi phí thực tế và ngân sách của 6 tháng gần nhất,

**Then** biểu đồ line chart hiển 2 đường (chi phí vs ngân sách); tháng chưa có dữ liệu hiện 0; tooltip hiện số tiền VND; có thể export chart dưới dạng PNG.

**Checklist Unit Test:**

- [ ]  getLast6MonthsLabels(currentDate) trả array 6 chuỗi tháng đúng định dạng (vd: ['01/2025',...,'06/2025'])

- [ ]  getMonthlySpending(invoices, '2025-06') tính đúng tổng chi phí tháng 6/2025

- [ ]  getMonthlyBudgetHistory(6) trả array 6 phần tử; tháng chưa set ngân sách trả về null hoặc 0

- [ ]  buildChartData(invoices, budgetHistory) trả đúng format Recharts [{month, spent, budget}]

- [ ]  Tháng không có hóa đơn: spent = 0 (không throw, không skip điểm)

- [ ]  Tooltip formatter: formatVND(1500000) === '1.500.000 ₫'

- [ ]  exportChartAsPNG: hàm gọi html2canvas với đúng ref element; trả Blob không rỗng (mock html2canvas)

## 16.3  EPIC 9 — Xuất Báo Cáo PDF

### US-32 — Xuất báo cáo PDF tổng hợp tháng

**Acceptance Criteria:**

**Given** người dùng chọn tháng cần xuất báo cáo,

**When** nhấn nút Xuất PDF,

**Then** file PDF download được trên mọi trình duyệt; bao gồm logo placeholder, bảng danh sách HĐ đầy đủ, dòng tổng cộng, số trang; font tiếng Việt không bị lỗi ký tự.

**Checklist Unit Test:**

- [ ]  buildReportData(invoices, month) trả object đúng {title, month, rows, totals}

- [ ]  buildReportData([]) trả totals={total:0, vat:0} và rows=[]

- [ ]  formatMonthTitle('2025-06') === 'Tháng 06/2025'

- [ ]  generatePDFBuffer(reportData) trả ArrayBuffer có size > 0 (mock jsPDF)

- [ ]  triggerDownload(buffer, filename) gọi đúng URL.createObjectURL và click anchor (mock)

- [ ]  Tên file: filename chứa tháng đúng định dạng (vd: 'BaoCao_T06_2025.pdf')

- [ ]  Số trang: addPageNumbers(doc, totalPages) gọi đúng số lần = totalPages

- [ ]  Font: jsPDF config dùng font hỗ trợ Unicode; không có ký tự □ trong output text (integration test)

### US-33 — PDF có biểu đồ chi phí

**Acceptance Criteria:**

**Given** báo cáo PDF được tạo,

**When** hệ thống render biểu đồ và nhúng vào PDF,

**Then** bar chart chi phí theo tuần hiển trong PDF; pie chart top 5 NCC có chú thích; màu sắc nhất quán với app; biểu đồ không bị trắng/blank trong file PDF.

**Checklist Unit Test:**

- [ ]  getTop5Vendors(invoices) trả array ≤5 phần tử, sắp xếp theo tổng tiền giảm dần

- [ ]  getTop5Vendors([]) trả []

- [ ]  getTop5Vendors(invoices có 3 NCC) trả đúng 3 phần tử

- [ ]  buildWeeklyChartData(invoices, month) trả array 4-5 tuần với đúng tổng từng tuần

- [ ]  renderChartToCanvas(chartRef) gọi html2canvas; trả dataURL bắt đầu bằng 'data:image/png'

- [ ]  embedImageInPDF(doc, dataURL, x, y, w, h) gọi doc.addImage với đúng tham số (mock jsPDF)

- [ ]  Kích thước ảnh trong PDF: width và height nằm trong giới hạn trang A4 (595x842pt)

### US-34 — Chọn khoảng thời gian khi xuất PDF

**Acceptance Criteria:**

**Given** người dùng mở dialog xuất PDF,

**When** chọn khoảng thời gian (tháng này / quý này / tùy chỉnh),

**Then** số lượng hóa đơn sẽ xuất hiển preview trước khi tải; file PDF chứa đúng dữ liệu khoảng thời gian đã chọn.

**Checklist Unit Test:**

- [ ]  getPresetRange('this_month', currentDate) trả {from: ngày 1 tháng, to: ngày cuối tháng}

- [ ]  getPresetRange('this_quarter', currentDate) trả đúng {from, to} cho quý hiện tại

- [ ]  getPresetRange('custom', {from:'2025-01-01', to:'2025-03-31'}) trả đúng range tùy chỉnh

- [ ]  countInvoicesInRange(invoices, from, to) đếm đúng số HĐ trong khoảng

- [ ]  countInvoicesInRange với range không có HĐ nào trả 0

- [ ]  validateDateRange(from, to): from > to throw error; from === to hợp lệ (1 ngày)

- [ ]  PreviewCount component: hiển thị đúng số từ countInvoicesInRange; cập nhật khi range thay đổi

- [ ]  ExportButton: disabled khi countInvoicesInRange === 0

### US-35 — Xuất PDF 1 hóa đơn cụ thể

**Acceptance Criteria:**

**Given** người dùng đang xem chi tiết một hóa đơn đã xác nhận,

**When** nhấn nút Xuất PDF hóa đơn này,

**Then** PDF 1 trang chứa đủ 12 trường dữ liệu; thumbnail ảnh hóa đơn gốc ở cuối trang; watermark ĐÃ XÁC NHẬN in nghiêng màu xanh; download ngay lập tức.

**Checklist Unit Test:**

- [ ]  buildSingleInvoicePDF(invoice) không throw với InvoiceData hợp lệ đủ 12 trường

- [ ]  buildSingleInvoicePDF(invoice với trường null) điền 'N/A' thay vì crash

- [ ]  addWatermark(doc, 'ĐÃ XÁC NHẬN') gọi doc.setTextColor và doc.text với góc xoay 45° (mock)

- [ ]  Tên file: filename = 'HoaDon_' + invoice.invoice_number + '.pdf'

- [ ]  Ảnh thumbnail: nếu invoice.image_url tồn tại thì addImage được gọi; nếu null thì bỏ qua không lỗi

- [ ]  PDF chỉ 1 trang: doc.getNumberOfPages() === 1 sau khi build

- [ ]  Chỉ xuất được HĐ status === CONFIRMED; status PENDING hoặc REJECTED throw PermissionError

## 16.4  EPIC 10 — Onboarding Người Dùng Mới

### US-36 — Welcome screen 3 bước

**Acceptance Criteria:**

**Given** người dùng mở app lần đầu tiên (chưa có dữ liệu trong localStorage),

**When** app khởi động,

**Then** Welcome modal xuất hiện tự động; hiển 3 bước dạng animation (Upload → OCR → Xuất); nút Bắt đầu đưa thẳng đến vùng Upload; nút Bỏ qua đóng modal; modal không xuất hiện lại lần sau.

**Checklist Unit Test:**

- [ ]  isFirstVisit(): localStorage không có 'onboarding_completed' → trả true

- [ ]  isFirstVisit(): localStorage có 'onboarding_completed'=true → trả false

- [ ]  WelcomeModal: render khi isFirstVisit() === true; không render khi false

- [ ]  Nhấn Bỏ qua: modal đóng; localStorage.setItem('onboarding_completed', true) được gọi

- [ ]  Nhấn Bắt đầu: modal đóng; scrollTo hoặc focus vào UploadZone được gọi (mock)

- [ ]  Sau Bỏ qua: reload lại app → WelcomeModal không hiển (isFirstVisit === false)

- [ ]  3 bước hiển đúng thứ tự; step indicator active đúng bước đang xem

- [ ]  Animation: CSS class transition được apply đúng khi chuyển bước

### US-37 — Tooltip onboarding tại chỗ

**Acceptance Criteria:**

**Given** người dùng mới hoàn tất Welcome screen hoặc bỏ qua,

**When** lần đầu tương tác với các khu vực chính (UploadZone, nút Xử lý, bảng Review, nút Xuất),

**Then** tooltip hướng dẫn xuất hiện đúng vị trí; mỗi tooltip có nút Tiếp theo và Bỏ qua tour; sau khi hoàn tất tour không hiển lại; có thể reset tour từ Settings.

**Checklist Unit Test:**

- [ ]  useOnboarding hook: currentStep mặc định = 0 khi chưa có flag

- [ ]  nextStep(): currentStep tăng từ 0 → 1 → ... → n

- [ ]  nextStep() ở bước cuối: isCompleted = true; lưu 'tour_completed' vào localStorage

- [ ]  skipTour(): isCompleted = true; localStorage flag được set

- [ ]  resetTour(): xóa 'tour_completed' khỏi localStorage; currentStep = 0

- [ ]  isTourCompleted(): trả true khi localStorage có flag; false khi không có

- [ ]  TourPopover: render đúng target element tại step hiện tại (mock getBoundingClientRect)

- [ ]  5 tour steps config: đủ id, target selector, title, content, placement

### US-38 — Hóa đơn mẫu demo

**Acceptance Criteria:**

**Given** người dùng đang ở Welcome screen hoặc trang Upload trống,

**When** nhấn nút Dùng hóa đơn mẫu,

**Then** hóa đơn demo được load với dữ liệu OCR pre-filled đầy đủ 12 trường; badge DEMO hiển rõ trên card; người dùng có thể review như hóa đơn thật; nút Xóa demo dọn sạch khỏi danh sách.

**Checklist Unit Test:**

- [ ]  getDemoInvoice() trả InvoiceData hợp lệ với đủ 12 trường và is_demo: true

- [ ]  getDemoInvoice().confidence: tất cả trường có confidence ≥ 90 (demo data chất lượng cao)

- [ ]  loadDemoInvoice(): thêm demo vào invoiceList; status = PENDING

- [ ]  isDemoInvoice(invoice) === true khi invoice.is_demo === true

- [ ]  deleteDemoInvoices(list) xóa tất cả HĐ có is_demo === true; giữ HĐ thật

- [ ]  DemoCard: render badge 'DEMO' khi is_demo === true; không render badge khi false

- [ ]  Xóa demo: sau deleteDemoInvoices, invoiceList không còn phần tử is_demo === true

### US-39 — Video hướng dẫn

**Acceptance Criteria:**

**Given** người dùng nhấn link Xem video hướng dẫn (từ Help hoặc Welcome screen),

**When** VideoModal mở ra,

**Then** video YouTube nhúng trong modal không autoplay; đóng modal dừng video bằng cách destroy iframe; phụ đề tiếng Việt có thể bật; không rời trang.

**Checklist Unit Test:**

- [ ]  VideoModal: render khi isOpen=true; không render khi isOpen=false

- [ ]  YouTube embed URL có param autoplay=0 (không tự phát)

- [ ]  YouTube embed URL có param cc_lang_pref=vi&cc_load_policy=1 (phụ đề Việt)

- [ ]  Đóng modal: onClose được gọi; iframe src bị set thành '' để dừng video

- [ ]  VideoModal snapshot: src URL đúng định dạng YouTube embed

- [ ]  Keyboard: nhấn Escape gọi onClose (useEffect keydown listener test)

- [ ]  Không navigate: modal mở không thay đổi window.location (mock navigation)

### US-40 — Trang Help / FAQ

**Acceptance Criteria:**

**Given** người dùng mở trang Help,

**When** trang hiển danh sách 10 câu hỏi thường gặp dạng accordion,

**Then** có ô search để lọc câu hỏi; câu hỏi không khớp ẩn đi; link báo lỗi và email hỗ trợ hiển rõ; không có broken link.

**Checklist Unit Test:**

- [ ]  faqData: array có đúng 10 phần tử; mỗi phần tử có {id, question, answer}

- [ ]  filterFAQ('upload') trả các FAQ chứa 'upload' trong question hoặc answer

- [ ]  filterFAQ('') trả toàn bộ 10 FAQ

- [ ]  filterFAQ('câu hỏi không tồn tại xyz') trả []

- [ ]  Accordion: click câu hỏi → isOpen toggle; click lại → đóng

- [ ]  Chỉ 1 accordion mở tại 1 thời điểm (nếu single-open mode): mở câu 2 tự đóng câu 1

- [ ]  Email link: href bắt đầu bằng 'mailto:'; không phải '#' hay 'javascript:'

- [ ]  Báo lỗi link: href là URL hợp lệ (bắt đầu https://); không 404 khi fetch (integration test)

## 16.5  Nhắc nhở — DoD Chung Áp Dụng Cho EPIC 7–10

Tất cả Unit Test thuộc EPIC 7–10 phải tuân thủ bộ Checklist Tổng Quát đã định nghĩa tại Section 9.7, bao gồm:

- [ ]  Cấu trúc & Tổ chức: file .test.ts cùng thư mục; describe/it rõ ràng; Single Responsibility mỗi test

- [ ]  Coverage: ≥80% cho function xử lý search, budget, PDF; ≥70% cho utility format/validate/calculate

- [ ]  Mock & Stub: mock Fuse.js, jsPDF, html2canvas, YouTube API; reset mock trong afterEach

- [ ]  React Component: dùng @testing-library/react; query theo role/label; userEvent cho tương tác

- [ ]  Performance: mỗi test <200ms; dùng jest.useFakeTimers() cho debounce và throttle

- [ ]  Không có console.error trên happy path; CI pipeline không có flaky test
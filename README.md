# AccoBot - Trợ lý Kế toán Tự động

AccoBot là một ứng dụng web AI giúp tự động hóa quy trình kế toán bằng cách trích xuất dữ liệu từ các tệp hóa đơn (hình ảnh, PDF) bằng sự hỗ trợ của mô hình ngôn ngữ lớn (Gemini), cho phép người dùng kiểm duyệt thông tin và cuối cùng xuất bảng thống kê dữ liệu dưới dạng tệp Excel.

## Các tính năng chính

*   **Tải lên hóa đơn đa định dạng:** Hỗ trợ tải lên ảnh (JPG, PNG) và file PDF của hóa đơn thông qua giao diện kéo-thả trực quan.
*   **Trích xuất dữ liệu tự động (OCR & AI):** Sử dụng sức mạnh của Google Gemini API để phân tích văn bản trong hóa đơn, tự động nhận dạng các nội dung quan trọng:
    *   Ngày tháng lập hóa đơn
    *   Số hóa đơn
    *   Tên đơn vị bán hàng, mã số thuế
    *   Chi tiết từng mặt hàng (Tên hàng, số lượng, đơn giá, thành tiền)
    *   Tổng tiền, thuế suất VAT, tiền thuế
*   **Hệ thống chờ duyệt (Review Queue):** Dữ liệu sau khi trích xuất sẽ được đánh giá mức độ tin cậy. Giao diện xem trước cho phép nhân viên kế toán đối chiếu song song ảnh gốc và dữ liệu được trích xuất để chỉnh sửa và xác nhận trước khi lưu vào hệ thống.
*   **Quản lý & Thống kê:** Bảng liệt kê các hóa đơn đã được duyệt với thông tin tổng quan, trạng thái thanh toán. Trang Dashboard cung cấp biểu đồ thống kê trực quan về tổng chi tiêu, trạng thái hóa đơn...
*   **Xuất khẩu dữ liệu:** Tích hợp tính năng xuất toàn bộ danh sách hóa đơn ra file Excel (`.xlsx`) để dễ dàng tích hợp với các phần mềm kế toán khác.

## Công nghệ sử dụng

*   **Front-end:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide Icons
*   **Back-end API:** Node.js, Express (hoặc tích hợp dưới dạng Vercel Serverless Functions)
*   **AI Integration:** `@google/genai` (Google Gemini 2.5 Flash)
*   **Xử lý File:** `multer`, `react-dropzone`
*   **Xuất Excel:** `xlsx`
*   **State Management:** React Context API

## Hướng dẫn cài đặt và chạy (Local Development)

### 1. Yêu cầu hệ thống
*   Đã cài đặt **Node.js** (Khuyến nghị phiên bản 18+).

### 2. Cài đặt các thư viện
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
npm install
```

### 3. Cấu hình Biến môi trường (Environment Variables)
Tạo một tệp `.env` tại thư mục gốc của dự án nếu chưa có, và thêm API Key của Google Gemini:
```env
GEMINI_API_KEY="AIzaSy... (API Key của bạn)"
```
*(Nếu sử dụng Visual Studio Code, lưu ý đảm bảo tệp `.env` được lưu thành công ở chuẩn UTF-8 và project đã được load đầy đủ để có thể nhận dạng các biến trong quá trình chạy server).*

### 4. Chạy dự án
Có hai dịch vụ cần được khởi chạy trong dự án này lúc dev: Frontend Vite và Backend Node. Hệ thống được cấu hình sẵn lệnh `dev`, chạy server bằng `tsx`:
```bash
npm run dev
```

Server sẽ khởi chạy tại (mặc định) `http://localhost:3000`. Cả backend API (`/api/*`) và frontend middleware sẽ chạy trên cổng này.

## Lưu ý về triển khai (Deploy)

*   Dự án hỗ trợ build cho môi trường Cloud Run hoặc container:
    ```bash
    npm run build
    npm run start
    ```
*   Khi deploy (chẳng hạn như Vercel), hãy thiết lập thư mục build tĩnh (`dist`) và cấu hình các Serverless Function trong thư mục `/api` nếu API backend của bạn phân loại ra chạy serverless. Hoặc tuân thủ tài liệu cấu hình theo dạng app Node.js tùy thuộc vào platform.
*   **Tuyệt đối không** lộ `GEMINI_API_KEY` dưới client-side (trình duyệt). Key phải được lưu dưới dạng Secret Variables trên server hoặc platform deploy.

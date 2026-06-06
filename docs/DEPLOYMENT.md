# Hướng Dẫn Deploy (Triển Khai) Ứng Dụng Lên Vercel

Dự án AccoBot được viết bằng **Next.js 15 (App Router)** nên việc triển khai lên **Vercel** cực kỳ đơn giản vì Vercel là nền tảng tối ưu hóa tốt nhất cho Next.js (không cần cấu hình file `vercel.json`).

Dưới đây là hướng dẫn từng bước chi tiết để bạn đưa sản phẩm lên môi trường Internet thực tế.

---

## 📋 Bước 1: Chuẩn bị mã nguồn và Database

1. **Đưa code lên GitHub:**
   * Hãy đảm bảo toàn bộ mã nguồn hiện tại của bạn đã được đẩy (push) lên một kho chứa (Repository) trên **GitHub** (hoặc GitLab/Bitbucket).
2. **Khởi tạo Database Supabase:**
   * Đảm bảo bạn đã chạy script SQL tạo bảng `invoices` và bật bảo mật `RLS` trên Supabase (như hướng dẫn trong [walkthrough.md](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/8b0167ac-985a-4766-b1b9-9f23c1ee94c4/walkthrough.md)).

---

## 🚀 Bước 2: Triển khai dự án trên Vercel Dashboard

1. Truy cập trang chủ **[Vercel Dashboard](https://vercel.com/dashboard)** và đăng nhập bằng tài khoản GitHub của bạn.
2. Nhấn nút **Add New** (ở góc phải) -> Chọn **Project**.
3. Danh sách các Repository trên GitHub của bạn sẽ hiện ra. Hãy tìm dự án hóa đơn kế toán này và nhấn nút **Import**.
4. Ở màn hình **Configure Project** (Cấu hình dự án):
   * **Framework Preset:** Vercel sẽ tự động nhận diện và chọn **Next.js**.
   * **Root Directory:** Giữ nguyên `./` (thư mục gốc).
   * **Build and Output Settings:** Giữ nguyên mặc định.
   * **Environment Variables (Cực kỳ quan trọng):** 
     Hãy mở rộng phần này ra và sao chép chính xác các cặp khóa - giá trị từ file `.env` cục bộ của bạn vào đây:
     
     | Tên biến (Key) | Giá trị (Value) | Giải thích |
     | :--- | :--- | :--- |
     | `GEMINI_API_KEY` | *API Key của bạn* | Khóa dùng để gọi dịch vụ AI Gemini OCR |
     | `NEXT_PUBLIC_SUPABASE_URL` | *URL dự án Supabase* | Link kết nối đến Database Supabase |
     | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Anon Key* | Khóa công khai của Supabase |
     | `CLOUDINARY_CLOUD_NAME` | *Cloud Name* | Tên đám mây lưu ảnh Cloudinary |
     | `CLOUDINARY_API_KEY` | *API Key Cloudinary* | Khóa kết nối Cloudinary |
     | `CLOUDINARY_API_SECRET` | *API Secret* | Khóa bảo mật Cloudinary |

     *Lưu ý: Nhớ nhấn nút **Add** sau khi nhập từng biến.*

5. Nhấn nút **Deploy** ở dưới cùng.
6. Hệ thống sẽ tiến hành build dự án. Quá trình này thường mất khoảng **1 - 2 phút**. Khi hoàn tất, bạn sẽ thấy màn hình pháo hoa chúc mừng kèm theo ảnh xem trước của trang web.

---

## ⚙️ Bước 3: Cấu hình lại Redirect URL trên Supabase (Để Auth hoạt động chuẩn xác)

Sau khi deploy xong, Vercel sẽ cấp cho bạn một tên miền miễn phí (ví dụ: `https://accobot-demo.vercel.app`). 

Để chức năng gửi email xác nhận và chuyển hướng người dùng khi nhấp vào link hoạt động chính xác trên môi trường thật, bạn cần cập nhật link này vào Supabase:

1. Truy cập vào **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Chọn dự án của bạn -> Vào mục **Authentication** (biểu tượng hình chìa khóa) ở menu bên trái.
3. Chọn mục **URL Configuration** ở menu con.
4. Ở phần **Site URL**:
   * Sửa đổi đường link mặc định (đang là `http://localhost:3000` hoặc trống) thành đường link trang web thật của bạn trên Vercel (ví dụ: `https://accobot-demo.vercel.app`).
5. Ở phần **Redirect URLs** (nếu có):
   * Bạn có thể thêm link: `https://accobot-demo.vercel.app/**` để cho phép tự động chuyển hướng về mọi trang con của web.
6. Nhấn **Save** để lưu lại.

---

## 🔄 Cách cập nhật sản phẩm sau này (CI/CD)

Vercel được tích hợp sẵn hệ thống Tích hợp và Triển khai tự động (CI/CD). Sau này, mỗi khi bạn thay đổi code ở máy tính cá nhân:
1. Bạn chỉ cần thực hiện `git add`, `git commit` và `git push` lên GitHub.
2. Vercel sẽ tự động phát hiện thay đổi và tiến hành build, deploy phiên bản mới lên internet trong vòng 1 phút mà bạn không cần phải làm lại bất kỳ thao tác thủ công nào trên website Vercel nữa.

---

## 🛠️ Xử lý sự cố thường gặp (Troubleshooting)

### Lỗi: `No Output Directory named "dist" found after the Build completed`

**Nguyên nhân:**
Lỗi này xảy ra khi bạn deploy đè lên một Project Vercel cũ đã được cấu hình cho **Vite / React** trước đó. Vercel vẫn giữ cài đặt cũ và tìm kiếm thư mục đầu ra là `dist`, trong khi **Next.js** xuất dữ liệu ra thư mục `.next`.

**Cách khắc phục:**
1. Truy cập vào **Vercel Dashboard**.
2. Chọn dự án của bạn -> Chuyển sang tab **Settings** (ở trên cùng).
3. Chọn mục **Build & Development Settings** ở menu bên trái.
4. Tại phần **Framework Preset**, đổi từ `Vite` (hoặc `Other`) thành **`Next.js`**.
5. Ở phần **Build Command** và **Output Directory**, hãy đảm bảo nút gạt **Override** đang tắt (để Vercel tự động sử dụng mặc định của Next.js). Nếu nút đang bật, hãy tắt đi hoặc bấm **Reset**.
6. Nhấn **Save** để lưu lại.
7. Quay lại tab **Deployments**, chọn bản deploy bị lỗi mới nhất, bấm vào nút 3 chấm bên phải -> Chọn **Redeploy** (hoặc thực hiện push một commit mới lên GitHub) để Vercel build lại.

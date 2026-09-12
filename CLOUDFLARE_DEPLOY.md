# Hướng dẫn đưa ứng dụng lên Cloudflare Pages

Dự án này đã được tối ưu sẵn để chạy cực nhanh và miễn phí trên **Cloudflare Pages**.

## Cách 1: Tự động (Khuyên dùng - Dành cho người không chuyên code)

1. **Xuất mã nguồn lên GitHub**:
   - Ngay tại giao diện Google AI Studio này, bạn bấm vào nút **Settings (Cài đặt)** hoặc **Share (Chia sẻ)** ở góc trên bên phải màn hình.
   - Chọn **Export to GitHub** (hoặc Download ZIP rồi tự đẩy lên GitHub của bạn).

2. **Kết nối với Cloudflare Pages**:
   - Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/) và đăng nhập/đăng ký.
   - Ở menu bên trái, chọn **Workers & Pages**.
   - Bấm nút **Create application** -> Chuyển sang tab **Pages** -> Bấm **Connect to Git**.
   - Đăng nhập vào GitHub và chọn kho lưu trữ (repository) bạn vừa tạo ở bước 1.
   - Bấm **Begin setup**.

3. **Cấu hình Build (Rất quan trọng)**:
   - Framework preset: Chọn **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Bấm **Save and Deploy**.

Cloudflare sẽ tự động tải code của bạn về, đóng gói và cấp cho bạn một đường dẫn (URL) siêu tốc độ để truy cập trên toàn cầu. Mỗi khi bạn sửa code trên GitHub, Cloudflare cũng tự động cập nhật lại web cho bạn!

## Cách 2: Thủ công qua dòng lệnh (Dành cho Dev)

Nếu bạn đã cài Node.js và Wrangler trên máy:

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name="podcast-app"
```

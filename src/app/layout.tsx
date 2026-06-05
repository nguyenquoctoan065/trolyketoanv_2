import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AccoBot - Trợ lý kế toán AI',
  description: 'Tự động trích xuất thông tin hóa đơn (ảnh/PDF) chỉ trong vài giây.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../store';
import { OfflineSyncManager } from '../OfflineSyncManager';
import OfflineQueue from '../components/OfflineQueue';

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
      <body>
        <AppProvider>
          {children}
          <OfflineSyncManager />
          <OfflineQueue />
        </AppProvider>
      </body>
    </html>
  );
}

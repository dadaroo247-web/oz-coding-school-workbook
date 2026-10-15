import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/common/Providers';
import ThemeWrapper from '@/components/layout/ThemeWrapper';

export const metadata: Metadata = {
  title: 'TodoFlow',
  description: '실시간 할 일 관리 앱',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <ThemeWrapper>{children}</ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}

import type { ReactNode } from 'react';

import './globals.css';

export const metadata = {
  title: 'Market Insights Center',
  description: 'Member insights and staff admin console'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}


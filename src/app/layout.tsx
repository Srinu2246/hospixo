import type { Metadata } from 'next';

import { AppProvider } from '@/providers/AppProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Hospixo Platform',
  description: 'Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

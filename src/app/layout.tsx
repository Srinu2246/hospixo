import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { readShellSession } from '@/lib/auth/shell-session';
import { AppProvider } from '@/providers/AppProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Hospixo Platform',
  description: 'Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = readShellSession(cookies());

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <AppShell initialSession={session}>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}

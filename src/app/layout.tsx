import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import { readShellSession } from '@/lib/auth/shell-session';
import { AppProvider } from '@/providers/AppProvider';
import { MuiCacheProvider } from '@/providers/MuiCacheProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Hospixo Platform',
  description: 'Application',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = readShellSession(await cookies());

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <MuiCacheProvider>
          <AppProvider>
            <AppShell initialSession={session}>{children}</AppShell>
          </AppProvider>
        </MuiCacheProvider>
      </body>
    </html>
  );
}

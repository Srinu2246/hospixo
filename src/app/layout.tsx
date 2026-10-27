import type { Metadata } from 'next';
import { Stack_Sans_Text } from 'next/font/google';
import { cookies } from 'next/headers';

import { AppShell } from '@/components/layout/AppShell';
import { readShellSession } from '@/lib/auth/shell-session';
import { AppProvider } from '@/providers/AppProvider';
import { MuiCacheProvider } from '@/providers/MuiCacheProvider';

const stackSansText = Stack_Sans_Text({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-stack-sans-text',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

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
    <html lang="en" className={stackSansText.variable} suppressHydrationWarning>
      <body className={stackSansText.className}>
        <MuiCacheProvider>
          <AppProvider>
            <AppShell initialSession={session}>{children}</AppShell>
          </AppProvider>
        </MuiCacheProvider>
      </body>
    </html>
  );
}

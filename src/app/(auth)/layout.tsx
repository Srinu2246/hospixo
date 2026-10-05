import type { ReactNode } from 'react';

import { AuthThemeProvider } from '@/providers/AuthThemeProvider';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthThemeProvider>
      <main style={{ display: 'flex', minHeight: '100vh', flex: 1, flexDirection: 'column' }}>
        {children}
      </main>
    </AuthThemeProvider>
  );
}

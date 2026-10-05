import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import ControlPlaneShell from '@/components/shell/layout/ControlPlaneShell';
import { AUTH_ROUTES } from '@/constants/routes';
import { getAdminSession } from '@/services/auth.server';

export default async function ControlPlaneLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getAdminSession();
  if (!session) {
    redirect(AUTH_ROUTES.login);
  }

  return <ControlPlaneShell userEmail={session.email}>{children}</ControlPlaneShell>;
}

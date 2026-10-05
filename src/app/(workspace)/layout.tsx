import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AuthSessionSync } from '@/components/auth/auth-session-sync';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { routes } from '@/config/routes';
import { getServerAuthSession } from '@/lib/auth/session';

export default async function WorkspaceLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect(routes.auth.login);
  }

  return (
    <>
      <AuthSessionSync user={session.user} />
      <WorkspaceShell>{children}</WorkspaceShell>
    </>
  );
}

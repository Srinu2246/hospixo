import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginScreen } from '@/features/auth/components/login-screen';
import { getServerAuthSession } from '@/lib/auth/session';
import { resolveDashboardHomePath } from '@/lib/auth/access-level';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Hospixo workspace.',
};

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session) {
    redirect(resolveDashboardHomePath(session.user));
  }
  return <LoginScreen />;
}

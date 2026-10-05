import type { Metadata } from 'next';

import { PlatformLoginScreen } from '@/features/auth/components/platform-login-screen';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Hospixo workspace.',
};

export default function LoginPage() {
  return <PlatformLoginScreen />;
}

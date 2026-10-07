import type { Metadata } from 'next';

import { LoginScreen } from '@/features/auth/components/login-screen';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Hospixo workspace.',
};

export default function LoginPage() {
  return <LoginScreen />;
}

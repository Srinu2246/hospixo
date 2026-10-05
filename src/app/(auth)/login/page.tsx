import type { Metadata } from 'next';

import LoginForm from '@/components/auth/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Hospixo admin control plane sign in.',
};

export default function LoginPage() {
  return <LoginForm />;
}

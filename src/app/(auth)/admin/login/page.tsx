import type { Metadata } from 'next';

import LoginForm from '@/components/auth/forms/LoginForm';

export const metadata: Metadata = {
  title: 'Admin sign in',
  description: 'Hospixo admin control plane sign in.',
};

export default function AdminLoginPage() {
  return <LoginForm />;
}

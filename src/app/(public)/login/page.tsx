import type { Metadata } from 'next';

import { LoginForm } from '@/features/auth/components/lazyAuthForms';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Hospixo workspace.',
  robots: { index: false, follow: false },
};

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    domain?: string;
    email?: string;
  }>;
}>;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <LoginForm
      serverError={params.error}
      defaultDomain={params.domain}
      defaultEmail={params.email}
    />
  );
}

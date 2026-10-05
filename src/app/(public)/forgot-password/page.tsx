import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/features/auth/components/lazyAuthForms';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your Hospixo account password.',
  robots: { index: false, follow: false },
};

type ForgotPasswordPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    email?: string;
  }>;
}>;

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return <ForgotPasswordForm serverError={params.error} defaultEmail={params.email} />;
}

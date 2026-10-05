import type { Metadata } from 'next';

import { OtpLoginForm } from '@/features/auth/components/lazyAuthForms';

export const metadata: Metadata = {
  title: 'Sign in with OTP',
  description: 'Receive a one-time code to sign in to Hospixo.',
  robots: { index: false, follow: false },
};

type OtpLoginPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    identifier?: string;
  }>;
}>;

export default async function OtpLoginPage({ searchParams }: OtpLoginPageProps) {
  const params = await searchParams;

  return <OtpLoginForm serverError={params.error} defaultIdentifier={params.identifier} />;
}

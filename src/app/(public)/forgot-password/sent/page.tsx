import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { ForgotPasswordSent } from '@/features/auth/components/forms/ForgotPasswordSent';
import { AUTH_ROUTES } from '@/lib/constants/routes';

export const metadata: Metadata = {
  title: 'Check your email',
  description: 'Password reset instructions sent.',
  robots: { index: false, follow: false },
};

type ForgotPasswordSentPageProps = Readonly<{
  searchParams: Promise<{
    email?: string;
  }>;
}>;

export default async function ForgotPasswordSentPage({
  searchParams,
}: ForgotPasswordSentPageProps) {
  const params = await searchParams;
  const email = params.email?.trim();

  if (!email) {
    redirect(AUTH_ROUTES.forgotPassword);
  }

  return <ForgotPasswordSent email={email} />;
}

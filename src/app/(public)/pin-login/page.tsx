import type { Metadata } from 'next';

import { PinLoginForm } from '@/features/auth/components/lazyAuthForms';

export const metadata: Metadata = {
  title: 'Branch PIN sign in',
  description: 'Sign in with your branch PIN on a shared device.',
  robots: { index: false, follow: false },
};

type PinLoginPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    branch_id?: string;
  }>;
}>;

export default async function PinLoginPage({ searchParams }: PinLoginPageProps) {
  const params = await searchParams;

  return <PinLoginForm serverError={params.error} defaultBranchId={params.branch_id} />;
}

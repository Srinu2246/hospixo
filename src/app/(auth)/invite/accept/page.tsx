import type { Metadata } from 'next';

import { InviteAcceptForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Accept invitation',
  description: 'Accept your Hospixo team invitation and create your password.',
  robots: { index: false, follow: false },
};

type AcceptInvitationPageProps = Readonly<{
  searchParams: Promise<{ token?: string }>;
}>;

export default async function AcceptInvitationPage({ searchParams }: AcceptInvitationPageProps) {
  const { token = '' } = await searchParams;
  return <InviteAcceptForm token={token} />;
}

export const dynamic = 'force-dynamic';

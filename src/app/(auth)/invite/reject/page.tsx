import type { Metadata } from 'next';

import { InviteRejectForm } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Decline invitation',
  description: 'Decline a Hospixo team invitation.',
  robots: { index: false, follow: false },
};

type RejectInvitationPageProps = Readonly<{
  searchParams: Promise<{ token?: string }>;
}>;

export default async function RejectInvitationPage({ searchParams }: RejectInvitationPageProps) {
  const { token = '' } = await searchParams;
  return <InviteRejectForm token={token} />;
}

export const dynamic = 'force-dynamic';

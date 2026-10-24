import type { Metadata } from 'next';

import { InviteAcceptPage } from '@/features/authentication';
import { readInviteToken } from '@/lib/auth/readInviteToken';

export const metadata: Metadata = {
  title: 'Accept invitation | Hospixo Platform',
  description: 'Accept your Hospixo team invitation and create your password.',
  robots: { index: false, follow: false },
};

type AcceptInvitationRouteProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function AcceptInvitationRoute({ searchParams }: AcceptInvitationRouteProps) {
  const params = await searchParams;
  return <InviteAcceptPage token={readInviteToken(params)} />;
}

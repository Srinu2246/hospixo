import type { Metadata } from 'next';

import { InvitationDetail } from '@/features/user-roles';
import { loadInvitationDetailPageData } from '@/lib/invitations-server';

export const metadata: Metadata = { title: 'Invitation' };

type InvitationRouteProps = Readonly<{
  params: Promise<{ invitationId: string }>;
}>;

/** SSR invitation detail — loaded on the server from the session cookie. */
export default async function InvitationDetailRoute({ params }: InvitationRouteProps) {
  const { invitationId } = await params;
  const data = await loadInvitationDetailPageData(invitationId);

  return <InvitationDetail invitationId={invitationId} initialData={data} />;
}

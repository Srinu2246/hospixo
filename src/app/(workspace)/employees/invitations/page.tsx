import { Suspense } from 'react';
import type { Metadata } from 'next';

import { InvitationsList } from '@/features/user-roles';
import { loadInvitationsListPageData } from '@/lib/invitations-server';

export const metadata: Metadata = { title: 'Invitations' };

type InvitationsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function InvitationsRoute({ searchParams }: InvitationsPageProps) {
  const params = (await searchParams) ?? {};
  const data = await loadInvitationsListPageData(params);

  return (
    <Suspense fallback={null}>
      <InvitationsList data={data} />
    </Suspense>
  );
}

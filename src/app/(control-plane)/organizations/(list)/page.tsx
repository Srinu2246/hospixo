import type { Metadata } from 'next';
import { Suspense } from 'react';

import OrganizationListView from '@/components/organization/OrganizationListView';
import { OrganizationListSkeleton } from '@/components/organization/list/organization-list-skeleton';

export const metadata: Metadata = {
  title: 'Organization Management',
};

export default async function OrganizationsListPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const params = await searchParams;
  const initialSearchQuery = typeof params.q === 'string' ? params.q.trim() : '';

  return (
    <Suspense fallback={<OrganizationListSkeleton />}>
      <OrganizationListView initialSearchQuery={initialSearchQuery} />
    </Suspense>
  );
}

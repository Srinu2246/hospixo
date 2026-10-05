import type { Metadata } from 'next';

import { UsersListPage } from '@/features/user-roles';
import { loadUsersListPageData } from '@/lib/users-server';

export const metadata: Metadata = { title: 'Branch Users & Roles' };

type PageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function BranchStaffPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const data = await loadUsersListPageData(params, { hierarchyLevel: 'branch' });

  return <UsersListPage data={data} preferServerData />;
}

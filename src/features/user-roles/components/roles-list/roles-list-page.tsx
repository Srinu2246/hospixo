import { loadRolesListPageData } from '@/lib/roles-server';

import { RolesListPageContent } from './roles-list-page-content';

type RolesListPageProps = Readonly<{
  title?: string;
}>;

export async function RolesListPage({ title = 'Roles' }: RolesListPageProps) {
  const { roles, error } = await loadRolesListPageData();
  return <RolesListPageContent roles={roles} error={error} title={title} />;
}

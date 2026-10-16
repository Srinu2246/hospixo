import type { Metadata } from 'next';

import { UsersAndRolesScreen } from '@/features/employees/user-roles';
import { parseUserList } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { ScopeType } from '@/types/user-roles';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import { serverApi } from '@/services/api/serverClient';

export const metadata: Metadata = {
  title: 'Users & Roles | Hospixo Platform',
  description: 'Manage your team members and their system access levels.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default async function ScopedUsersAndRolesPage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  const scope = resolveScope(resolvedParams.scope);
  const initialUserList = await readInitialUserList();

  return <UsersAndRolesScreen scope={scope} initialUserList={initialUserList} />;
}

async function readInitialUserList() {
  try {
    const payload = await serverApi.get<unknown>(ApiUrlsV1.users.list, {
      page: 1,
      page_size: 8,
    });
    return parseUserList(payload);
  } catch {
    return undefined;
  }
}

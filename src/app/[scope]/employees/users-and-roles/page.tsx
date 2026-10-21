import type { Metadata } from 'next';

import { UsersAndRolesScreen } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

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

  return <UsersAndRolesScreen scope={scope} />;
}

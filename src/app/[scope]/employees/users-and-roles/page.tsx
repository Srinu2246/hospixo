import type { Metadata } from 'next';

import { UsersAndRolesScreen } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Users & Roles | Hospixo Platform',
  description: 'Manage your team members and their system access levels.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedUsersAndRolesPage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  const scope = resolveScope(resolvedParams.scope);

  return <UsersAndRolesScreen scope={scope} />;
}

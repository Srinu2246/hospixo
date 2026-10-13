import type { Metadata } from 'next';
import { UsersAndRolesScreen } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Users & Roles | Hospixo Platform',
  description: 'Manage your team members and their system access levels.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedUsersAndRolesPage({ params }: Readonly<ScopeRouteProps>) {
  return <UsersAndRolesScreen scope={resolveScope(params.scope)} />;
}

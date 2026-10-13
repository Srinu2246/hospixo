import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Configure Permissions | Hospixo Platform',
  description: 'Configure access levels and role permissions.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedConfigurePermissionsPage({ params }: Readonly<ScopeRouteProps>) {
  return <CreateUserMultiformFlow initialStep="permissions" scope={resolveScope(params.scope)} />;
}

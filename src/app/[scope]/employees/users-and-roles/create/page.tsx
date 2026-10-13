import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Create User | Hospixo Platform',
  description: 'Add a new team member.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedCreateUserPage({ params }: Readonly<ScopeRouteProps>) {
  return <CreateUserMultiformFlow initialStep="user-form" scope={resolveScope(params.scope)} />;
}

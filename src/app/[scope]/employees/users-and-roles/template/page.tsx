import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Select Role Template | Hospixo Platform',
  description: 'Choose a starting template to configure specific permissions.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedRoleTemplatePage({ params }: Readonly<ScopeRouteProps>) {
  return <CreateUserMultiformFlow initialStep="template" scope={resolveScope(params.scope)} />;
}

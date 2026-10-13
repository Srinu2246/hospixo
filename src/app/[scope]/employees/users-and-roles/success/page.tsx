import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Invitation Sent | Hospixo Platform',
  description: 'User invitation has been sent successfully.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedSuccessPage({ params }: Readonly<ScopeRouteProps>) {
  return <CreateUserMultiformFlow initialStep="success" scope={resolveScope(params.scope)} />;
}

import type { Metadata } from 'next';
import { EditStaffProfileScreen } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Staff Profile | Hospixo Platform',
  description: 'View user details and permissions.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedViewStaffProfilePage({ params }: Readonly<ScopeRouteProps>) {
  return <EditStaffProfileScreen initialMode="view" scope={resolveScope(params.scope)} />;
}

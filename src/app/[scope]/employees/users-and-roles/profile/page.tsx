import type { Metadata } from 'next';
import { EditStaffProfileScreen } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Staff Profile | Hospixo Platform',
  description: 'View user details and permissions.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default async function ScopedViewStaffProfilePage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return <EditStaffProfileScreen initialMode="view" scope={resolveScope(resolvedParams.scope)} />;
}

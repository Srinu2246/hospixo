import type { Metadata } from 'next';
import { EditStaffProfileScreen } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Edit Staff Profile | Hospixo Platform',
  description: 'Modify user details and permissions.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default async function ScopedEditStaffProfilePage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return <EditStaffProfileScreen initialMode="edit" scope={resolveScope(resolvedParams.scope)} />;
}

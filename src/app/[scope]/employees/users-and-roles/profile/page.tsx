import type { Metadata } from 'next';
import { EditStaffProfileScreen } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Staff Profile | Hospixo Platform',
  description: 'View user details and permissions.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedViewStaffProfilePage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return <EditStaffProfileScreen initialMode="view" scope={resolveScope(resolvedParams.scope)} />;
}

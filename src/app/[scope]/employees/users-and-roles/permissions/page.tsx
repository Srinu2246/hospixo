import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Configure Permissions | Hospixo Platform',
  description: 'Configure access levels and role permissions.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedConfigurePermissionsPage({
  params,
}: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return (
    <CreateUserMultiformFlow initialStep="permissions" scope={resolveScope(resolvedParams.scope)} />
  );
}

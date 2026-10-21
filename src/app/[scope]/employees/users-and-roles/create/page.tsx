import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Create User | Hospixo Platform',
  description: 'Add a new team member.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedCreateUserPage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return (
    <CreateUserMultiformFlow initialStep="user-form" scope={resolveScope(resolvedParams.scope)} />
  );
}

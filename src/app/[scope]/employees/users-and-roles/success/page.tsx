import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'User Created Successfully | Hospixo Platform',
  description: 'Confirmation and summary after creating a new user.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedSuccessPage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return (
    <CreateUserMultiformFlow initialStep="success" scope={resolveScope(resolvedParams.scope)} />
  );
}

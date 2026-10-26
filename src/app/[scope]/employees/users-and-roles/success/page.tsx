import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Invitation Sent | Hospixo Platform',
  description: 'User invitation has been sent successfully.',
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

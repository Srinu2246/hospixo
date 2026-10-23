import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Review & Save User | Hospixo Platform',
  description: 'Review details before finalizing user invitation.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedReviewUserPage({ params }: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return (
    <CreateUserMultiformFlow initialStep="review" scope={resolveScope(resolvedParams.scope)} />
  );
}

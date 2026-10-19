import type { Metadata } from 'next';
import { CreateCustomTemplateScreen } from '@/features/employees/user-roles';
import { resolveScope } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Create Custom Role Template | Hospixo Platform',
  description: 'Define custom roles and permissions.',
};

interface ScopeRouteProps {
  params: Promise<{ scope: string }>;
}

export default async function ScopedCreateCustomTemplatePage({
  params,
}: Readonly<ScopeRouteProps>) {
  const resolvedParams = await params;
  return <CreateCustomTemplateScreen scope={resolveScope(resolvedParams.scope)} />;
}

import type { Metadata } from 'next';
import { CreateCustomTemplateScreen } from '@/features/employees/user-roles';
import type { ScopeType } from '@/types/user-roles';

export const metadata: Metadata = {
  title: 'Create Custom Role Template | Hospixo Platform',
  description: 'Define custom roles and permissions.',
};

interface ScopeRouteProps {
  params: { scope: string };
}

function resolveScope(raw: string): ScopeType {
  if (raw === 'company') return 'company';
  if (raw === 'branch' || raw === 'branch-manager') return 'branch';
  return 'organization';
}

export default function ScopedCreateCustomTemplatePage({ params }: Readonly<ScopeRouteProps>) {
  return <CreateCustomTemplateScreen scope={resolveScope(params.scope)} />;
}

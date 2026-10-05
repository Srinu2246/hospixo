import { ADMIN_ROUTES } from '@/constants/routes';

export type OrganizationTab =
  'overview' | 'subscription' | 'companies' | 'branches' | 'activity' | 'audit-log' | 'settings';

export function organizationTabPath(organizationId: string, tab: OrganizationTab): string {
  return `${ADMIN_ROUTES.organizations}/${encodeURIComponent(organizationId)}/${tab}`;
}

export function organizationCreatePath(): string {
  return ADMIN_ROUTES.organizationsCreateDetails;
}

export function companyCreatePath(organizationId?: string): string {
  if (!organizationId) return ADMIN_ROUTES.organizations;
  return `${ADMIN_ROUTES.organizations}/${encodeURIComponent(organizationId)}/companies`;
}

import type { SidebarContext } from '@/app/sidebar';
import type { TopNavbarLevel } from './topNavbarHelpers';

export interface ResolveEntityScopeLabelParams {
  level: TopNavbarLevel;
  context?: SidebarContext;
  account?: unknown;
  resolvedCompanyName?: string;
  resolvedBranchName?: string;
}

/**
 * Extracts organization name from an authenticated account record if present.
 */
export function readOrganizationNameFromAccount(account: unknown): string | undefined {
  if (!account || typeof account !== 'object') {
    return undefined;
  }
  const record = account as Record<string, unknown>;
  const flatName =
    (typeof record.organization_name === 'string' && record.organization_name.trim()) ||
    (typeof record.org_name === 'string' && record.org_name.trim()) ||
    (typeof record.organizationName === 'string' && record.organizationName.trim()) ||
    (typeof record.organization_title === 'string' && record.organization_title.trim());
  if (flatName) {
    return flatName;
  }

  if (record.organization && typeof record.organization === 'object') {
    const orgRecord = record.organization as Record<string, unknown>;
    if (typeof orgRecord.name === 'string' && orgRecord.name.trim()) {
      return orgRecord.name.trim();
    }
  }

  return undefined;
}

/**
 * Resolves the entity label displayed under the Hospixo logo in the sidebar:
 * - Organization level: Display organization name only. Never company or branch name.
 * - Company level: Display company name only. Never branch or organization name.
 * - Branch level: Display branch name only. Never company or organization name.
 */
export function resolveEntityScopeLabel(
  params: Readonly<ResolveEntityScopeLabelParams>,
): string | null {
  const { level, context, account, resolvedCompanyName, resolvedBranchName } = params;

  if (level === 'organization') {
    if (context?.organizationName?.trim()) {
      return context.organizationName.trim();
    }
    const fromAccount = readOrganizationNameFromAccount(account);
    if (fromAccount) {
      return fromAccount;
    }
    if (context?.organizationSlug?.trim()) {
      return context.organizationSlug.trim();
    }
    return null;
  }

  if (level === 'company') {
    if (context?.companyName?.trim()) {
      return context.companyName.trim();
    }
    if (resolvedCompanyName?.trim()) {
      return resolvedCompanyName.trim();
    }
    if (context?.companySlug?.trim()) {
      return context.companySlug.trim();
    }
    return null;
  }

  if (level === 'branch') {
    if (resolvedBranchName?.trim()) {
      return resolvedBranchName.trim();
    }
    if (context?.branchName?.trim()) {
      return context.branchName.trim();
    }
    if (context?.branchSlug?.trim()) {
      return context.branchSlug.trim();
    }
    return null;
  }

  return null;
}

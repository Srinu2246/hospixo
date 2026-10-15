import { normalizeRoleKey } from '@/app/sidebar';
import { organizationCompaniesPath } from '@/services/api/ApiUrlsV1';
import {
  parseCompanyList,
  type CompanyListItem,
} from '@/lib/schemas/organization/companies/companyListSchema';
import type { QueryParams } from '@/services/api/types';

type GetJson = (path: string, params?: QueryParams) => Promise<unknown>;

export type LoadOrganizationCompaniesContext = {
  role?: string | null;
  authScope?: string | null;
  companyId?: number | null;
  scope?: 'organization' | 'company' | 'branch' | null;
  force?: boolean;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

const inFlightByOrgId = new Map<number, Promise<CompanyListItem[]>>();

function isPlatformOperator(role?: string | null, authScope?: string | null): boolean {
  const scope = (authScope ?? '').trim().toLowerCase();
  if (scope === 'platform') return true;
  if (!role?.trim()) return false;
  const key = normalizeRoleKey(role);
  return key === 'super_admin' || key === 'platform_support' || key.includes('platform');
}

function mayListOrganizationCompanies(role?: string | null, authScope?: string | null): boolean {
  if (isPlatformOperator(role, authScope)) return true;
  if (!role?.trim()) return false;
  return normalizeRoleKey(role) === 'organization';
}

/** Org-wide company directory — organisation scope only (see AGENTS: helpers in lib/helpers). */
export function shouldLoadOrganizationCompanyList(options: {
  role?: string | null;
  authScope?: string | null;
  companyId?: number | null;
  scope?: 'organization' | 'company' | 'branch' | null;
}): boolean {
  if (options.companyId != null) return false;
  if (options.scope != null && options.scope !== 'organization') return false;
  return mayListOrganizationCompanies(options.role, options.authScope);
}

/**
 * GET /v2/platform/organizations/{org_id}/companies (paginated).
 * Does not call /v1/companies.
 */
export async function loadOrganizationCompanies(
  organizationId: number | undefined,
  get: GetJson,
  context?: LoadOrganizationCompaniesContext,
): Promise<CompanyListItem[]> {
  const allowed =
    context?.force === true ||
    shouldLoadOrganizationCompanyList({
      role: context?.role,
      authScope: context?.authScope,
      companyId: context?.companyId,
      scope: context?.scope,
    });

  if (!allowed || organizationId == null) {
    return [];
  }

  const existing = inFlightByOrgId.get(organizationId);
  if (existing) return existing;

  const pending = fetchAllPlatformCompanies(organizationId, get).finally(() => {
    if (inFlightByOrgId.get(organizationId) === pending) {
      inFlightByOrgId.delete(organizationId);
    }
  });
  inFlightByOrgId.set(organizationId, pending);
  return pending;
}

async function fetchAllPlatformCompanies(
  organizationId: number,
  get: GetJson,
): Promise<CompanyListItem[]> {
  const collected: CompanyListItem[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    const payload = await get(organizationCompaniesPath(organizationId), {
      page,
      page_size: PAGE_SIZE,
    });
    const batch = parseCompanyList(payload);
    collected.push(...batch);

    const totalPages = readTotalPages(payload, page);
    if (batch.length === 0 || page >= totalPages) break;
    page += 1;
  }

  return dedupeById(collected);
}

function readTotalPages(payload: unknown, currentPage: number): number {
  const root = isRecord(payload) ? payload : null;
  const data =
    root?.success === true && isRecord(root.data) ? root.data : isRecord(payload) ? payload : null;
  const totalPages = data?.total_pages ?? data?.totalPages;
  const parsed = typeof totalPages === 'number' ? totalPages : Number(totalPages);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : currentPage;
}

function dedupeById(items: readonly CompanyListItem[]): CompanyListItem[] {
  const byId = new Map<string, CompanyListItem>();
  for (const item of items) byId.set(String(item.id), item);
  return [...byId.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

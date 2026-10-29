import { normalizeRoleKey } from '@/app/sidebar';
import ApiUrlsV1, { organizationCompaniesPath } from '@/services/api/ApiUrlsV1';
import {
  parseCompanyList,
  type CompanyListItem,
} from '@/lib/schemas/organization/companies/companyListSchema';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import {
  calculateCompanyUserCounts,
  enrichCompaniesWithUserCounts,
  fetchOrganizationUsers,
} from '@/lib/helpers/organizationUserCounts';
import { ApiError, type QueryParams } from '@/services/api/types';
import type { JsonObject, JsonValue } from '@/types/json';

export { calculateCompanyUserCounts, enrichCompaniesWithUserCounts, fetchOrganizationUsers };

type GetJson = (path: string, params?: QueryParams) => Promise<JsonValue>;

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

function readTotalPages(payload: JsonValue, currentPage: number): number {
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

function isRecord(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** GET /v1/companies/{id} when the list endpoint is forbidden for the current role. */
export async function loadCompanyById(
  companyId: number | string,
  get: GetJson,
): Promise<CompanyListItem | null> {
  const detailPath = `${ApiUrlsV1.organization.companies}/${encodeURIComponent(String(companyId))}`;

  for (const path of [detailPath, ApiUrlsV1.organization.companies] as const) {
    try {
      const params =
        path === ApiUrlsV1.organization.companies ? { company_id: companyId } : undefined;
      const items = parseCompanyList(await get(path, params));
      const match = items.find((item) => String(item.id) === String(companyId));
      if (match) return match;
      if (items.length === 1) return items[0];
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error;
    }
  }

  return null;
}

function isMissingEndpoint(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

/**
 * Count live branches grouped by company ID.
 */
export function countBranchesByCompany(branches: readonly BranchListItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const branch of branches) {
    if (branch.companyId != null && Number(branch.companyId) > 0) {
      const key = String(branch.companyId);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Merge live branch counts into company items.
 * Ensures each company's branchCount accurately reflects its live branches.
 */
export function mergeCompaniesWithBranchCounts(
  companies: readonly CompanyListItem[],
  branches: readonly BranchListItem[],
): CompanyListItem[] {
  const counts = countBranchesByCompany(branches);
  return companies.map((company) => {
    const liveCount = counts.get(String(company.id));
    return {
      ...company,
      branchCount: liveCount ?? 0,
    };
  });
}

import { cache } from 'react';

import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import { ApiRequestError } from '@/lib/api/errors';
import { platformCompanyBranchesPath } from '@/lib/api/paths';
import type { ApiBranch, BranchesListResponse } from '@/types/branches';

import { listOrganizationCompanies } from './companies';

const ORGANIZATION_BRANCHES_BATCH_SIZE = 5;

/** Backend Branches paths — server-side only via apiFetch. */
export const branchesPaths = {
  list: '/api/v1/branches',
  byTenant: (
    organizationId: number | string,
    companyId: number | string,
    branchId: number | string,
  ) =>
    `/api/v1/platform/organizations/${encodeURIComponent(String(organizationId))}/companies/${encodeURIComponent(String(companyId))}/branches/${encodeURIComponent(String(branchId))}`,
} as const;

function unwrapSuccessEnvelope(payload: unknown): unknown {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as { success: boolean }).success === true &&
    'data' in payload
  ) {
    return (payload as { data: unknown }).data;
  }

  return payload;
}

type FetchOptions = Readonly<{
  headers?: Record<string, string>;
}>;

async function fetchWithToken(
  token: string,
  path: string,
  options: FetchOptions = {},
): Promise<unknown> {
  const response = await fetch(new URL(path, getServerApiBaseUrl()), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiRequestError(
      (body as { message?: string }).message ?? response.statusText,
      response.status,
    );
  }

  const payload = await response.json();
  return unwrapSuccessEnvelope(payload);
}

function isBranchLike(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.id != null ||
    record.branch_id != null ||
    record.branchId != null ||
    record.branch_name != null ||
    record.branchName != null ||
    record.name != null
  );
}

function extractBranchArray(payload: unknown, depth = 0): unknown[] {
  if (depth > 5) {
    return [];
  }

  const unwrapped = unwrapSuccessEnvelope(payload);

  if (Array.isArray(unwrapped)) {
    if (unwrapped.length === 0 || isBranchLike(unwrapped[0])) {
      return unwrapped;
    }
    return [];
  }

  if (!unwrapped || typeof unwrapped !== 'object') {
    return [];
  }

  const record = unwrapped as Record<string, unknown>;

  for (const key of [
    'items',
    'branches',
    'data',
    'results',
    'result',
    'rows',
    'content',
    'list',
  ] as const) {
    const candidate = record[key];
    if (Array.isArray(candidate) && (candidate.length === 0 || isBranchLike(candidate[0]))) {
      return candidate;
    }

    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const nested = extractBranchArray(candidate, depth + 1);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function readBranchTotal(payload: unknown, depth = 0): number | null {
  if (depth > 5 || payload == null) {
    return null;
  }

  const unwrapped = unwrapSuccessEnvelope(payload);
  if (!unwrapped || typeof unwrapped !== 'object' || Array.isArray(unwrapped)) {
    return null;
  }

  const record = unwrapped as Record<string, unknown>;
  for (const key of [
    'total',
    'count',
    'total_count',
    'totalCount',
    'branch_count',
    'branches_count',
    'totalElements',
    'total_elements',
  ]) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
  }

  for (const key of ['data', 'meta', 'pagination'] as const) {
    const nested = record[key];
    if (nested && typeof nested === 'object') {
      const total = readBranchTotal(nested, depth + 1);
      if (total != null) {
        return total;
      }
    }
  }

  return null;
}

function unwrapBranches(payload: unknown): ApiBranch[] {
  return extractBranchArray(payload) as ApiBranch[];
}

function buildCompanyBranchesPath(
  orgId: string | number,
  companyId: string | number,
  pageSize = 100,
): string {
  const params = new URLSearchParams({
    page: '1',
    page_size: String(pageSize),
  });

  return `${platformCompanyBranchesPath(String(orgId), companyId)}?${params.toString()}`;
}

function mapBranch(raw: Record<string, unknown>, defaultCompanyId?: string | number): ApiBranch {
  const id = raw.id ?? raw.branch_id ?? raw.branchId;
  const companyId = raw.company_id ?? raw.companyId ?? defaultCompanyId ?? 0;
  const name = String(raw.name ?? raw.branch_name ?? raw.branchName ?? raw.outlet_name ?? 'Branch');

  return {
    id: Number(id),
    company_id: Number(companyId),
    name,
    code:
      raw.code != null
        ? String(raw.code)
        : raw.branch_code != null
          ? String(raw.branch_code)
          : null,
    city: raw.city != null ? String(raw.city) : null,
    state: raw.state != null ? String(raw.state) : null,
    country: raw.country != null ? String(raw.country) : '',
    is_default: Boolean(raw.is_default ?? raw.isDefault ?? false),
    status: raw.status != null ? String(raw.status) : 'active',
  };
}

function normalizeBranches(payload: unknown, defaultCompanyId?: string | number): ApiBranch[] {
  return unwrapBranches(payload).map((item) =>
    mapBranch(item as Record<string, unknown>, defaultCompanyId),
  );
}

function dedupeBranches(branches: readonly ApiBranch[]): ApiBranch[] {
  const byId = new Map<string, ApiBranch>();
  for (const branch of branches) {
    byId.set(String(branch.id), branch);
  }
  return [...byId.values()];
}

function filterBranchesByCompany(
  branches: readonly ApiBranch[],
  companyId: string | number,
): ApiBranch[] {
  const companyKey = String(companyId);
  return branches.filter(
    (branch) => !branch.company_id || String(branch.company_id) === companyKey,
  );
}

async function tryTenantBranchFetch(
  token: string,
  fetchBranches: () => Promise<unknown>,
  companyKey: string | null,
): Promise<ApiBranch[]> {
  try {
    const raw = await fetchBranches();
    const items = companyKey
      ? filterBranchesByCompany(normalizeBranches(raw), companyKey)
      : normalizeBranches(raw);
    return dedupeBranches(items);
  } catch {
    return [];
  }
}

async function loadTenantBranches(
  token: string,
  orgId: string | number,
  companyId?: string | number,
): Promise<ApiBranch[]> {
  const orgKey = String(orgId);
  const companyKey = companyId != null ? String(companyId) : null;

  if (companyKey) {
    const queryResult = await tryTenantBranchFetch(
      token,
      () => fetchWithToken(token, `/api/v1/branches?company_id=${encodeURIComponent(companyKey)}`),
      companyKey,
    );
    if (queryResult.length > 0) {
      return queryResult;
    }

    const headerResult = await tryTenantBranchFetch(
      token,
      () =>
        fetchWithToken(token, '/api/v1/branches', {
          headers: {
            'X-Company-Id': companyKey,
            'X-Organization-Id': orgKey,
          },
        }),
      companyKey,
    );
    return headerResult;
  }

  const pathResults = await Promise.all(
    [
      `/api/v1/branches?organization_id=${encodeURIComponent(orgKey)}`,
      `/api/v1/branches?org_id=${encodeURIComponent(orgKey)}`,
      '/api/v1/branches',
    ].map((path) => tryTenantBranchFetch(token, () => fetchWithToken(token, path), null)),
  );
  const combined = dedupeBranches(pathResults.flat());
  if (combined.length > 0) {
    return combined;
  }

  const headerVariants: Record<string, string>[] = [
    { 'X-Organization-Id': orgKey, 'X-Organisation-Id': orgKey, 'X-Org-Id': orgKey },
    { 'X-Organization-ID': orgKey },
  ];
  for (const headers of headerVariants) {
    const items = await tryTenantBranchFetch(
      token,
      () => fetchWithToken(token, '/api/v1/branches', { headers }),
      null,
    );
    if (items.length > 0) {
      return items;
    }
  }

  return [];
}

function parsePlatformCompanyBranchesPayload(
  raw: unknown,
  defaultCompanyId?: string | number,
): BranchesListResponse {
  const items = normalizeBranches(raw, defaultCompanyId);
  const reportedTotal = readBranchTotal(raw);
  return { items, total: reportedTotal ?? items.length };
}

async function fetchPlatformCompanyBranches(
  token: string,
  orgId: string | number,
  companyId: string | number,
  pageSize = 100,
): Promise<BranchesListResponse> {
  const path = buildCompanyBranchesPath(orgId, companyId, pageSize);

  const finish = async (raw: unknown): Promise<BranchesListResponse> => {
    const result = parsePlatformCompanyBranchesPayload(raw, companyId);
    const reportedTotal = readBranchTotal(raw);
    if (
      result.items.length === 0 &&
      reportedTotal != null &&
      reportedTotal > 0 &&
      pageSize !== reportedTotal
    ) {
      return fetchPlatformCompanyBranches(token, orgId, companyId, reportedTotal);
    }
    return result;
  };

  try {
    const raw = await apiFetch<unknown>(path, {
      baseUrl: getServerApiBaseUrl(),
      token,
    });
    return await finish(raw);
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 403 || error.status === 404)) {
      throw error;
    }

    const raw = await fetchWithToken(token, path);
    return await finish(raw);
  }
}

/** `GET /api/v1/platform/organizations/{org_id}/companies/{company_id}/branches`. */
export const listCompanyBranches = cache(async function listCompanyBranches(
  token: string,
  orgId: string | number,
  companyId: string | number,
): Promise<BranchesListResponse> {
  try {
    const platformResult = await fetchPlatformCompanyBranches(token, orgId, companyId);
    if (platformResult.items.length > 0) {
      return platformResult;
    }
  } catch (error) {
    if (!(error instanceof ApiRequestError && (error.status === 403 || error.status === 404))) {
      throw error;
    }
  }

  const tenantItems = await loadTenantBranches(token, orgId, companyId);
  return { items: tenantItems, total: tenantItems.length };
});

type OrganizationBranchCompany = Readonly<{
  id: string | number;
  name?: string;
}>;

/**
 * Loads all branches for an organization by aggregating per-company platform calls:
 * `GET /api/v1/platform/organizations/{org_id}/companies/{company_id}/branches`
 */
export async function listOrganizationBranches(
  token: string,
  orgId: string | number,
  companies?: readonly OrganizationBranchCompany[],
): Promise<BranchesListResponse> {
  let companyList = companies ? [...companies] : [];
  if (companies === undefined) {
    const companiesResult = await listOrganizationCompanies(token, orgId);
    companyList = companiesResult.items.map((company) => ({
      id: company.id,
      name: company.name,
    }));
  }

  if (companyList.length === 0) {
    const tenantBranches = await loadTenantBranches(token, orgId);
    if (tenantBranches.length > 0) {
      return { items: tenantBranches, total: tenantBranches.length };
    }
  }

  const combined: ApiBranch[] = [];

  for (let start = 0; start < companyList.length; start += ORGANIZATION_BRANCHES_BATCH_SIZE) {
    const batch = companyList.slice(start, start + ORGANIZATION_BRANCHES_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (company) => {
        try {
          const result = await listCompanyBranches(token, orgId, company.id);
          return result.items.map((b) => ({
            ...b,
            company_id: b.company_id || Number(company.id),
          }));
        } catch {
          return [];
        }
      }),
    );
    combined.push(...batchResults.flat());
  }

  const deduped = dedupeBranches(combined);
  return { items: deduped, total: deduped.length };
}

function withAuth(token: string) {
  return {
    baseUrl: getServerApiBaseUrl(),
    token,
  };
}

function normalizeBranchesList(
  data: BranchesListResponse | readonly ApiBranch[] | { items?: readonly ApiBranch[] },
): BranchesListResponse {
  if (Array.isArray(data)) {
    const items = data as readonly ApiBranch[];
    return { items, total: items.length };
  }

  const payload = data as BranchesListResponse & { items?: readonly ApiBranch[] };
  const items = payload.items ?? [];
  return {
    items,
    total: payload.total ?? items.length,
  };
}

/** GET /api/v1/branches — company branches for the signed-in tenant. */
export const listBranches = cache(async function listBranches(token: string) {
  const data = await apiFetch<BranchesListResponse | readonly ApiBranch[]>(
    branchesPaths.list,
    withAuth(token),
  );
  return normalizeBranchesList(data);
});

/** GET /api/v1/platform/organizations/{org_id}/companies/{company_id}/branches/{branch_id}. */
export async function getBranch(
  token: string,
  organizationId: number | string,
  companyId: number | string,
  branchId: number | string,
) {
  return apiFetch<ApiBranch>(
    branchesPaths.byTenant(organizationId, companyId, branchId),
    withAuth(token),
  );
}

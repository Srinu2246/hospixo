import { cache } from 'react';

import { getServerApiBaseUrl } from '@/lib/api/config';
import { ApiRequestError } from '@/lib/api/errors';
import { platformCompaniesPath } from '@/lib/api/paths';
import type { ApiCompany, CompaniesListResponse } from '@/types/companies';

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

async function fetchWithToken(token: string, path: string): Promise<unknown> {
  const response = await fetch(new URL(path, getServerApiBaseUrl()), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
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

function unwrapCompanies(payload: unknown): ApiCompany[] {
  const unwrapped = unwrapSuccessEnvelope(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped as ApiCompany[];
  }

  if (!unwrapped || typeof unwrapped !== 'object') {
    return [];
  }

  const record = unwrapped as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data as ApiCompany[];
  }

  for (const key of ['items', 'companies', 'results', 'result', 'rows'] as const) {
    if (Array.isArray(record[key])) {
      return record[key] as ApiCompany[];
    }
  }

  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    const nested = record.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) {
      return nested.data as ApiCompany[];
    }
    for (const key of ['items', 'companies', 'results', 'result', 'rows'] as const) {
      if (Array.isArray(nested[key])) {
        return nested[key] as ApiCompany[];
      }
    }
  }

  return [];
}

function mapCompany(raw: Record<string, unknown>, orgId: string | number): ApiCompany {
  const id = raw.id ?? raw.company_id ?? raw.companyId;
  const organizationId = raw.organization_id ?? raw.organizationId ?? orgId;
  const name = String(
    raw.business_name ??
      raw.company_name ??
      raw.name ??
      raw.businessName ??
      raw.companyName ??
      'Company',
  );

  return {
    id: id as number | string,
    organization_id: organizationId as number | string,
    name,
    code:
      raw.company_code != null
        ? String(raw.company_code)
        : raw.code != null
          ? String(raw.code)
          : null,
    business_type:
      raw.business_type != null
        ? String(raw.business_type)
        : raw.company_type != null
          ? String(raw.company_type)
          : raw.industry_vertical != null
            ? String(raw.industry_vertical)
            : null,
    status: raw.status != null ? String(raw.status) : null,
    branch_count: Number(raw.branch_count ?? raw.branches_count ?? 0),
    user_count: Number(raw.user_count ?? raw.users_count ?? 0),
    created_at: raw.created_at != null ? String(raw.created_at) : null,
  };
}

function normalizeCompanies(payload: unknown, orgId: string | number): ApiCompany[] {
  return unwrapCompanies(payload).map((item) => mapCompany(item as Record<string, unknown>, orgId));
}

function filterCompaniesByOrg(items: readonly ApiCompany[], orgId: string | number): ApiCompany[] {
  const orgKey = String(orgId);
  const scoped = items.filter(
    (company) => !company.organization_id || String(company.organization_id) === orgKey,
  );
  return scoped.length > 0 ? [...scoped] : [...items];
}

function dedupeCompanies(items: readonly ApiCompany[]): ApiCompany[] {
  const byId = new Map<string, ApiCompany>();
  for (const company of items) {
    byId.set(String(company.id), company);
  }
  return [...byId.values()];
}

async function loadTenantCompanies(token: string, orgId: string | number): Promise<ApiCompany[]> {
  const orgKey = String(orgId);
  const tenantPaths = [
    `/api/v1/companies?organization_id=${encodeURIComponent(orgKey)}`,
    `/api/v1/companies?org_id=${encodeURIComponent(orgKey)}`,
    '/api/v1/companies',
  ];

  const combined: ApiCompany[] = [];

  for (const path of tenantPaths) {
    try {
      const raw = await fetchWithToken(token, path);
      const items = filterCompaniesByOrg(normalizeCompanies(raw, orgId), orgId);
      combined.push(...items);
      if (combined.length > 0) break;
    } catch {
      // Try the next tenant companies endpoint.
    }
  }

  return dedupeCompanies(combined);
}

/**
 * `GET /api/v1/platform/organizations/{org_id}/companies` (platform admin)
 * `GET /api/v1/companies` (org_admin / tenant token fallback)
 */
export const listOrganizationCompanies = cache(async function listOrganizationCompanies(
  token: string,
  orgId: string | number,
): Promise<CompaniesListResponse> {
  const path = platformCompaniesPath(String(orgId));

  try {
    const raw = await fetchWithToken(token, path);
    const platformItems = normalizeCompanies(raw, orgId);
    if (platformItems.length > 0) {
      return { items: platformItems, total: platformItems.length };
    }
  } catch (error) {
    if (!(error instanceof ApiRequestError && (error.status === 403 || error.status === 404))) {
      throw error;
    }
  }

  const tenantItems = await loadTenantCompanies(token, orgId);
  return { items: tenantItems, total: tenantItems.length };
});

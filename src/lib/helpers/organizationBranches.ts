import ApiUrlsV1, { organizationCompanyBranchesPath } from '@/services/api/ApiUrlsV1';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import {
  parseBranchList,
  type BranchListItem,
} from '@/lib/schemas/organization/branches/branchListSchema';
import { ApiError, type QueryParams } from '@/services/api/types';

type GetJson = (path: string, params?: QueryParams) => Promise<unknown>;

/**
 * Load branches the same way as main.
 * A company uses its platform branches path, then `/v1/branches?company_id`.
 * An organization walks each company, then `/v1/branches?organization_id`.
 */
export async function loadOrganizationBranches(
  organizationId: number | undefined,
  companies: readonly CompanyListItem[],
  get: GetJson,
  companyId?: number,
): Promise<BranchListItem[]> {
  if (companyId != null && organizationId != null) {
    const scoped = await loadCompanyBranches(organizationId, companyId, get);
    if (scoped.length > 0) return scoped;
  }

  if (organizationId != null && companyId == null && companies.length > 0) {
    const collected: BranchListItem[] = [];
    for (const company of companies) {
      collected.push(...(await loadCompanyBranches(organizationId, company.id, get)));
    }
    if (collected.length > 0) return dedupeBranches(collected);
  }

  return dedupeBranches(await loadTenantBranches(organizationId, companyId, get));
}

async function loadCompanyBranches(
  organizationId: number,
  companyId: number | string,
  get: GetJson,
): Promise<BranchListItem[]> {
  try {
    const items = parseBranchList(
      await get(organizationCompanyBranchesPath(organizationId, companyId)),
      companyId,
    );
    if (items.length > 0) return items;
  } catch (error) {
    if (!isMissingEndpoint(error)) throw error;
  }

  try {
    return parseBranchList(
      await get(ApiUrlsV1.restaurant.branches, { company_id: companyId }),
      companyId,
    );
  } catch (error) {
    if (!isMissingEndpoint(error)) throw error;
  }

  return [];
}

async function loadTenantBranches(
  organizationId: number | undefined,
  companyId: number | undefined,
  get: GetJson,
): Promise<BranchListItem[]> {
  const attempts: QueryParams[] = [];
  if (companyId != null) attempts.push({ company_id: companyId });
  if (organizationId != null) {
    attempts.push({ organization_id: organizationId });
    attempts.push({ org_id: organizationId });
  }
  attempts.push({});

  for (const params of attempts) {
    try {
      const items = parseBranchList(await get(ApiUrlsV1.restaurant.branches, params), companyId);
      if (items.length > 0) return items;
    } catch (error) {
      if (!isMissingEndpoint(error)) throw error;
    }
  }

  return [];
}

function dedupeBranches(items: readonly BranchListItem[]): BranchListItem[] {
  const byId = new Map<string, BranchListItem>();
  for (const item of items) byId.set(String(item.id), item);
  return [...byId.values()];
}

function isMissingEndpoint(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

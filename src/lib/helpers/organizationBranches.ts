import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import {
  loadOrganizationCompanies,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import {
  parseBranchList,
  type BranchListItem,
} from '@/lib/schemas/organization/branches/branchListSchema';
import { ApiError, type QueryParams } from '@/services/api/types';
import type { JsonValue } from '@/types/json';

type GetJson = (path: string, params?: QueryParams) => Promise<JsonValue>;

/**
 * Load branches the same way as main.
 * A company loads `/v1/branches?company_id`.
 * An organization walks each company, then `/v1/branches?organization_id`.
 */
export async function loadOrganizationBranches(
  organizationId: number | undefined,
  companies: readonly CompanyListItem[],
  get: GetJson,
  companyId?: number,
): Promise<BranchListItem[]> {
  if (companyId != null) {
    const branches = await loadCompanyBranches(companyId, get);
    if (branches.length > 0) return dedupeBranches(branches);
  }

  if (organizationId != null && companyId == null && companies.length > 0) {
    const collected: BranchListItem[] = [];
    for (const company of companies) {
      collected.push(...(await loadCompanyBranches(company.id, get)));
    }
    if (collected.length > 0) return dedupeBranches(collected);
  }

  return dedupeBranches(await loadTenantBranches(organizationId, companyId, get));
}

/**
 * Branches with their company names filled in, for the All Branches screen.
 * Loads the organisation's companies first so every row can show its company.
 */
export async function loadBranchDirectory(
  organizationId: number | undefined,
  companyId: number | undefined,
  get: GetJson,
  context?: {
    role?: string | null;
    authScope?: string | null;
    scope?: 'organization' | 'company' | 'branch';
  },
): Promise<BranchListItem[]> {
  const scope = context?.scope ?? (companyId != null ? 'company' : 'organization');
  const listContext = {
    role: context?.role,
    authScope: context?.authScope,
    companyId,
    scope,
  };
  const listAllowed = shouldLoadOrganizationCompanyList(listContext);

  let companies: CompanyListItem[] = [];
  if (listAllowed && organizationId != null) {
    companies = await loadOrganizationCompanies(organizationId, get, listContext).catch(() => []);
  }
  const branches = await loadOrganizationBranches(organizationId, companies, get, companyId);
  const namesById = new Map(companies.map((company) => [String(company.id), company.name]));

  return branches.map((branch) => ({
    ...branch,
    companyName:
      branch.companyName ||
      namesById.get(String(branch.companyId)) ||
      `Company #${branch.companyId}`,
  }));
}

async function loadCompanyBranches(
  companyId: number | string,
  get: GetJson,
): Promise<BranchListItem[]> {
  try {
    const items = parseBranchList(
      await get(ApiUrlsV1.restaurant.branches, {
        company_id: companyId,
        page: 1,
        page_size: 100,
      }),
      companyId,
    );
    if (items.length > 0) return items;
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
  if (organizationId != null && companyId == null) {
    attempts.push({ organization_id: organizationId });
    attempts.push({ org_id: organizationId });
  }

  if (attempts.length === 0) {
    return [];
  }

  for (const params of attempts) {
    try {
      const items = parseBranchList(
        await get(ApiUrlsV1.restaurant.branches, { ...params, page: 1, page_size: 100 }),
        companyId,
      );
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

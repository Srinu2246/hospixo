import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import {
  parseUserList,
  type UserRoleItem,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { QueryParams } from '@/services/api/types';
import type { JsonValue } from '@/types/json';

type GetJson = (path: string, params?: QueryParams) => Promise<JsonValue>;

const USERS_PAGE_SIZE = 100;
const MAX_USERS_PAGES = 50;

/**
 * Fetch users from GET /v1/users (paginated).
 * Scoped by organization_id or company_id according to the session.
 */
export async function fetchOrganizationUsers(
  get: GetJson,
  baseParams?: QueryParams,
): Promise<UserRoleItem[]> {
  const collected: UserRoleItem[] = [];
  let page = 1;

  while (page <= MAX_USERS_PAGES) {
    try {
      const payload = await get(ApiUrlsV1.users.list, {
        ...baseParams,
        page,
        page_size: USERS_PAGE_SIZE,
      });
      const parsed = parseUserList(payload);
      collected.push(...parsed.items);

      if (parsed.items.length === 0 || collected.length >= parsed.total) {
        break;
      }
      page += 1;
    } catch {
      break;
    }
  }

  return dedupeUsersById(collected);
}

function dedupeUsersById(users: readonly UserRoleItem[]): UserRoleItem[] {
  const byId = new Map<string, UserRoleItem>();
  for (const user of users) {
    byId.set(String(user.id), user);
  }
  return [...byId.values()];
}

/**
 * Calculate user count for each company from users list.
 * Avoids double-counting users by tracking unique user IDs per company in a Set.
 */
export function calculateCompanyUserCounts(
  users: readonly UserRoleItem[],
  companies: readonly CompanyListItem[],
  branches?: readonly BranchListItem[],
): Map<string, number> {
  const usersByCompany = new Map<string, Set<string>>();
  for (const company of companies) {
    usersByCompany.set(String(company.id), new Set<string>());
  }

  const branchToCompany = new Map<string, string>();
  if (branches) {
    for (const branch of branches) {
      if (branch.companyId != null) {
        branchToCompany.set(String(branch.id), String(branch.companyId));
      }
    }
  }

  const companyNameToId = new Map<string, string>();
  for (const company of companies) {
    if (company.name?.trim()) {
      companyNameToId.set(company.name.trim().toLowerCase(), String(company.id));
    }
  }

  for (const user of users) {
    const userId = String(user.id);
    const companyIdFromUser = user.companyId != null ? String(user.companyId) : undefined;
    const companyIdFromBranch =
      user.branchId != null ? branchToCompany.get(String(user.branchId)) : undefined;
    const companyIdFromName = user.company?.trim()
      ? companyNameToId.get(user.company.trim().toLowerCase())
      : undefined;

    const matchedCompanyId = companyIdFromUser ?? companyIdFromBranch ?? companyIdFromName;
    if (matchedCompanyId) {
      usersByCompany.get(matchedCompanyId)?.add(userId);
    }
  }

  const counts = new Map<string, number>();
  for (const [companyId, userSet] of usersByCompany.entries()) {
    counts.set(companyId, userSet.size);
  }
  return counts;
}

/**
 * Calculate user count for each branch from users list.
 * Avoids double-counting users by tracking unique user IDs per branch in a Set.
 */
export function calculateBranchUserCounts(
  users: readonly UserRoleItem[],
  branches: readonly BranchListItem[],
): Map<number, number> {
  const usersByBranch = new Map<number, Set<string>>();
  for (const branch of branches) {
    usersByBranch.set(branch.id, new Set<string>());
  }

  const branchNameToId = new Map<string, number>();
  for (const branch of branches) {
    if (branch.name?.trim()) {
      branchNameToId.set(branch.name.trim().toLowerCase(), branch.id);
    }
  }

  for (const user of users) {
    const userId = String(user.id);
    const branchIdFromUser = user.branchId != null ? Number(user.branchId) : undefined;
    const branchIdFromName = user.branch?.trim()
      ? branchNameToId.get(user.branch.trim().toLowerCase())
      : undefined;

    const matchedBranchId = branchIdFromUser ?? branchIdFromName;
    if (matchedBranchId != null) {
      usersByBranch.get(matchedBranchId)?.add(userId);
    }
  }

  const counts = new Map<number, number>();
  for (const [branchId, userSet] of usersByBranch.entries()) {
    counts.set(branchId, userSet.size);
  }
  return counts;
}

/**
 * Enrich company items with accurate user counts.
 * Uses calculated counts when available, falling back to any verified response fields.
 */
export function enrichCompaniesWithUserCounts(
  companies: readonly CompanyListItem[],
  userCounts: Map<string, number>,
): CompanyListItem[] {
  return companies.map((company) => {
    const calculated = userCounts.get(String(company.id));
    const resolvedCount =
      calculated !== undefined && (calculated > 0 || company.userCount === 0)
        ? calculated
        : company.userCount;

    return {
      ...company,
      userCount: resolvedCount,
    };
  });
}

/**
 * Enrich branch items with accurate user counts.
 * Uses calculated counts when available, falling back to any verified response fields.
 */
export function enrichBranchesWithUserCounts(
  branches: readonly BranchListItem[],
  userCounts: Map<number, number>,
): BranchListItem[] {
  return branches.map((branch) => {
    const calculated = userCounts.get(branch.id);
    const resolvedCount =
      calculated !== undefined && (calculated > 0 || (branch.userCount ?? 0) === 0)
        ? calculated
        : (branch.userCount ?? 0);

    return {
      ...branch,
      userCount: resolvedCount,
    };
  });
}

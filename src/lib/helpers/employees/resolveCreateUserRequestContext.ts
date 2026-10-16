import { loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import { loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import {
  roleRequiresBranchId,
  type CreateUserRequestContext,
  type RoleCatalogItem,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { QueryParams } from '@/services/api/types';

type GetJson = (path: string, params?: QueryParams) => Promise<unknown>;

export type CreateUserIdHints = {
  organizationId?: number;
  companyId?: number;
  branchId?: number;
};

export type CreateUserNameHints = {
  company?: string;
  branch?: string;
};

export async function resolveCreateUserRequestContext(
  names: CreateUserNameHints,
  ids: CreateUserIdHints,
  get: GetJson,
  roleCatalog: readonly RoleCatalogItem[] = [],
  roleCode?: string,
): Promise<CreateUserRequestContext> {
  const needsBranch = roleCode ? roleRequiresBranchId(roleCode, roleCatalog) : false;
  const organizationId = ids.organizationId;
  if (organizationId == null || !Number.isFinite(organizationId)) {
    throw new Error('Organization is required to create a user.');
  }

  let companyId = normalizeId(ids.companyId);
  let branchId = normalizeId(ids.branchId);

  const companies = await loadOrganizationCompanies(organizationId, get).catch(() => []);
  const branches = await loadOrganizationBranches(
    organizationId,
    companies,
    get,
    companyId ?? undefined,
  ).catch(() => []);

  if (companyId == null && names.company?.trim()) {
    companyId = normalizeId(
      companies.find((company) => company.name === names.company?.trim())?.id,
    );
  }

  if (needsBranch && branchId == null && names.branch?.trim()) {
    const branchName = names.branch.trim();
    branchId = normalizeId(branches.find((branch) => branch.name === branchName)?.id);
  }

  if (companyId == null) {
    throw new Error('Company is required to create a user.');
  }

  if (needsBranch && branchId == null) {
    throw new Error('Branch is required for branch-scoped roles.');
  }

  return {
    organizationId,
    companyId,
    ...(needsBranch && branchId != null ? { branchId } : {}),
    roleCatalog,
    ...(roleCode ? { roleCode } : {}),
  };
}

function normalizeId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

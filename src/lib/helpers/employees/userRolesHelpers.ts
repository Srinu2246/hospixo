import { loadBranchDirectory, loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import { loadCompanyById, loadOrganizationCompanies } from '@/lib/helpers/organizationCompanies';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { PermissionCategory } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  roleRequiresBranchId,
  unwrapEnvelope,
  type CreateUserRequestContext,
  type RoleCatalogItem,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { QueryParams } from '@/services/api/types';

type GetJson = (path: string, params?: QueryParams) => Promise<unknown>;

export type SessionDirectoryHints = {
  companyId?: number;
  companyName?: string;
  branchId?: number;
  branchName?: string;
};

export type LoadEmployeeDirectoryInput = {
  organizationId?: number;
  companyId?: number;
  session: SessionDirectoryHints;
};

export type EmployeeDirectoryData = {
  companies: CompanyListItem[];
  branches: BranchListItem[];
};

export type CreateUserIdHints = {
  organizationId?: number;
  companyId?: number;
  branchId?: number;
};

export type CreateUserNameHints = {
  company?: string;
  branch?: string;
};

export function companiesFromBranches(branches: readonly BranchListItem[]): CompanyListItem[] {
  const counts = new Map<string, { item: CompanyListItem; branchCount: number }>();

  for (const branch of branches) {
    const companyId = branch.companyId;
    if (companyId === '' || companyId == null) continue;

    const key = String(companyId);
    const existing = counts.get(key);
    if (existing) {
      existing.branchCount += 1;
      if (branch.companyName?.trim()) {
        existing.item.name = branch.companyName.trim();
      }
      continue;
    }

    counts.set(key, {
      branchCount: 1,
      item: {
        id: companyId,
        name: branch.companyName?.trim() || `Company #${companyId}`,
        code: null,
        businessType: null,
        status: 'active',
        branchCount: 1,
        userCount: 0,
      },
    });
  }

  return [...counts.values()].map(({ item, branchCount }) => ({
    ...item,
    branchCount,
  }));
}

export function enrichDirectoryWithSession(
  companies: readonly CompanyListItem[],
  branches: readonly BranchListItem[],
  hints: SessionDirectoryHints,
): { companies: CompanyListItem[]; branches: BranchListItem[] } {
  let nextCompanies = [...companies];
  let nextBranches = [...branches];

  const companyId = hints.companyId;
  if (
    companyId != null &&
    !nextCompanies.some((company) => String(company.id) === String(companyId))
  ) {
    nextCompanies = [
      ...nextCompanies,
      {
        id: companyId,
        name: hints.companyName?.trim() || `Company #${companyId}`,
        code: null,
        businessType: null,
        status: 'active',
        branchCount: nextBranches.length,
        userCount: 0,
      },
    ];
  }

  const branchId = hints.branchId;
  if (branchId != null && !nextBranches.some((branch) => String(branch.id) === String(branchId))) {
    nextBranches = [
      ...nextBranches,
      {
        id: branchId,
        name: hints.branchName?.trim() || `Branch #${branchId}`,
        companyId: companyId ?? 0,
        companyName: hints.companyName ?? null,
        code: null,
        city: null,
        status: 'active',
      },
    ];
  }

  return { companies: nextCompanies, branches: nextBranches };
}

export async function loadEmployeeDirectory(
  input: LoadEmployeeDirectoryInput,
  get: GetJson,
): Promise<EmployeeDirectoryData> {
  const { organizationId, companyId, session } = input;

  const branches = await loadBranchDirectory(organizationId, companyId, get).catch(() => []);

  let companies: CompanyListItem[] = [];
  if (companyId == null && organizationId != null) {
    companies = await loadOrganizationCompanies(organizationId, get).catch(() => []);
  }

  if (companies.length === 0 && branches.length > 0) {
    companies = companiesFromBranches(branches);
  }

  if (companyId != null && !companies.some((c) => String(c.id) === String(companyId))) {
    const detail = await loadCompanyById(companyId, get).catch(() => null);
    if (detail) companies = [...companies, detail];
  }

  return enrichDirectoryWithSession(companies, branches, {
    companyId: companyId ?? session.companyId,
    companyName:
      session.companyName ?? companies.find((c) => String(c.id) === String(companyId))?.name,
    branchId: session.branchId,
    branchName: session.branchName,
  });
}

export function mergePermissionCategories(
  current: readonly PermissionCategory[],
  incoming: readonly PermissionCategory[],
): PermissionCategory[] {
  if (incoming.length === 0) return [...current];
  if (current.length === 0) return incoming.map((category) => ({ ...category }));

  const enabledByPermissionId = new Map<string, boolean>();
  for (const category of current) {
    for (const permission of category.permissions) {
      enabledByPermissionId.set(permission.id, permission.enabled);
    }
  }

  return incoming.map((category) => ({
    ...category,
    permissions: category.permissions.map((permission) => ({
      ...permission,
      enabled: enabledByPermissionId.get(permission.id) ?? permission.enabled,
    })),
  }));
}

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

  if (branchId == null && names.branch?.trim()) {
    const branchName = names.branch.trim();
    branchId = normalizeId(branches.find((branch) => branch.name === branchName)?.id);
  }

  if (companyId == null && branchId != null) {
    const matchedBranch = branches.find((branch) => normalizeId(branch.id) === branchId);
    if (matchedBranch?.companyId != null) {
      companyId = normalizeId(matchedBranch.companyId);
    }
  }

  if (companyId == null && names.branch?.trim()) {
    const matchedBranch = branches.find((branch) => branch.name === names.branch?.trim());
    if (matchedBranch?.companyId != null) {
      companyId = normalizeId(matchedBranch.companyId);
    }
  }

  if (!names.company?.trim() && companyId != null) {
    const matchedCompany = companies.find((c) => normalizeId(c.id) === companyId);
    if (matchedCompany?.name) {
      names.company = matchedCompany.name;
    }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function extractAssignedPermissionKeys(payload: unknown): Set<string> {
  const keys = new Set<string>();
  const unwrapped = unwrapEnvelope(payload);

  const addCandidate = (val: unknown) => {
    if (typeof val === 'string' && val.trim()) {
      keys.add(val.trim());
      keys.add(val.trim().toLowerCase());
    } else if (typeof val === 'number') {
      keys.add(String(val));
    }
  };

  const processItem = (item: unknown) => {
    if (typeof item === 'string' || typeof item === 'number') {
      addCandidate(item);
      return;
    }
    if (!isRecord(item)) return;

    const isExplicitlyDisabled =
      item.enabled === false ||
      item.granted === false ||
      item.active === false ||
      item.is_granted === false ||
      item.isGranted === false;

    if (isExplicitlyDisabled) return;

    for (const prop of [
      'id',
      'key',
      'code',
      'permission',
      'permission_id',
      'permissionId',
      'permission_code',
      'permissionCode',
      'permission_key',
      'permissionKey',
      'name',
    ] as const) {
      if (item[prop] !== undefined && item[prop] !== null) {
        addCandidate(item[prop]);
      }
    }

    for (const childProp of ['permissions', 'items', 'children'] as const) {
      if (Array.isArray(item[childProp])) {
        for (const child of item[childProp] as unknown[]) {
          processItem(child);
        }
      }
    }
  };

  if (Array.isArray(unwrapped)) {
    for (const item of unwrapped) {
      processItem(item);
    }
  } else if (isRecord(unwrapped)) {
    for (const listProp of [
      'permissions',
      'items',
      'data',
      'results',
      'rows',
      'effective_permissions',
      'effectivePermissions',
      'permission_codes',
      'permissionCodes',
      'inherited_permission_codes',
      'inheritedPermissionCodes',
    ] as const) {
      if (Array.isArray(unwrapped[listProp])) {
        for (const item of unwrapped[listProp] as unknown[]) {
          processItem(item);
        }
      }
    }
    for (const [k, v] of Object.entries(unwrapped)) {
      if (v === true) {
        addCandidate(k);
      }
    }
  }

  return keys;
}

export function autoEnableRolePermissions(
  categories: readonly PermissionCategory[],
  assignedKeys: Set<string>,
): PermissionCategory[] {
  if (assignedKeys.size === 0) return [...categories];

  return categories.map((category) => {
    return {
      ...category,
      permissions: category.permissions.map((perm) => {
        const candidateCode =
          'code' in perm && typeof (perm as Record<string, unknown>).code === 'string'
            ? ((perm as Record<string, unknown>).code as string)
            : undefined;
        const isAssigned =
          assignedKeys.has(perm.id) ||
          assignedKeys.has(perm.id.toLowerCase()) ||
          assignedKeys.has(perm.name) ||
          assignedKeys.has(perm.name.toLowerCase()) ||
          (candidateCode
            ? assignedKeys.has(candidateCode) || assignedKeys.has(candidateCode.toLowerCase())
            : false);

        return {
          ...perm,
          enabled: isAssigned,
        };
      }),
    };
  });
}

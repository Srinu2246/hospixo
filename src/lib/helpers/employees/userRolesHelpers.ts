import { loadBranchDirectory, loadOrganizationBranches } from '@/lib/helpers/organizationBranches';
import {
  loadCompanyById,
  loadOrganizationCompanies,
  shouldLoadOrganizationCompanyList,
} from '@/lib/helpers/organizationCompanies';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { PermissionCategory } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  roleRequiresBranchId,
  roleRequiresCompanyId,
  rolePermissionsPayloadSchema,
  unwrapEnvelope,
  type CreateUserRequestContext,
  type RoleCatalogItem,
  type RolePermissionsPayload,
  isMatch,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { ScopeType } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { QueryParams } from '@/services/api/types';
import { userRolePermissionsPath } from '@/services/api/ApiUrlsV1';

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
  role?: string | null;
  authScope?: string | null;
  scope?: 'organization' | 'company' | 'branch';
};

export type EmployeeDirectoryData = {
  companies: CompanyListItem[];
  branches: BranchListItem[];
};

export type EmployeeDirectoryQueryOptions = {
  companyId: number | undefined;
  directoryScope: 'organization' | 'company' | 'branch';
  lockCompanyField: boolean;
};

/** Company-scoped logins load one company; org admins load the full directory on org routes. */
export function resolveEmployeeDirectoryOptions(input: {
  wizardScope: ScopeType;
  contextCompanyId?: number;
  accountCompanyId?: number;
  role?: string | null;
  authScope?: string | null;
}): EmployeeDirectoryQueryOptions {
  const sessionCompanyId = input.contextCompanyId ?? input.accountCompanyId;
  const mayListAllCompanies = shouldLoadOrganizationCompanyList({
    role: input.role,
    authScope: input.authScope,
    companyId: null,
    scope: 'organization',
  });

  if (mayListAllCompanies && input.wizardScope === 'organization') {
    return { companyId: undefined, directoryScope: 'organization', lockCompanyField: false };
  }

  if (input.wizardScope === 'branch') {
    return {
      companyId: sessionCompanyId,
      directoryScope: 'branch',
      lockCompanyField: true,
    };
  }

  if (sessionCompanyId != null) {
    return {
      companyId: sessionCompanyId,
      directoryScope: input.wizardScope === 'organization' ? 'company' : input.wizardScope,
      lockCompanyField: true,
    };
  }

  return {
    companyId: undefined,
    directoryScope: input.wizardScope === 'organization' ? 'organization' : 'company',
    lockCompanyField: input.wizardScope !== 'organization',
  };
}

export type CreateUserIdHints = {
  organizationId?: number;
  companyId?: number;
  branchId?: number;
};

export type CreateUserNameHints = {
  company?: string;
  branch?: string;
};

export { isMatch };

function normalizeLabel(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

/** Branch names for the create-user branch dropdown (company filter + keep current selection). */
export function resolveCreateUserBranchOptions(input: {
  branches: readonly BranchListItem[];
  companies: readonly CompanyListItem[];
  currentScope: ScopeType;
  activeCompanyLabel?: string;
  directoryCompanyId?: number | string;
  selectedBranchName?: string;
}): string[] {
  const {
    branches,
    companies,
    currentScope,
    activeCompanyLabel,
    directoryCompanyId,
    selectedBranchName,
  } = input;

  const activeCompany = normalizeLabel(activeCompanyLabel);
  const matchedCompany =
    activeCompany.length > 0
      ? companies.find((company) => normalizeLabel(company.name) === activeCompany)
      : undefined;

  let filtered = branches;

  if (currentScope === 'organization' && activeCompany.length > 0) {
    filtered = branches.filter((branch) => {
      if (normalizeLabel(branch.companyName) === activeCompany) return true;
      if (matchedCompany && String(branch.companyId) === String(matchedCompany.id)) return true;
      return false;
    });
  } else if (
    currentScope === 'company' &&
    directoryCompanyId != null &&
    directoryCompanyId !== ''
  ) {
    filtered = branches.filter((branch) => String(branch.companyId) === String(directoryCompanyId));
  }

  const names = filtered.map((branch) => branch.name).filter(Boolean);
  const selected = selectedBranchName?.trim();
  if (selected && !names.includes(selected)) {
    const selectedBranch = branches.find((branch) => branch.name.trim() === selected);
    if (selectedBranch) names.push(selectedBranch.name);
    else names.push(selected);
  }

  return names;
}

export function companiesFromBranches(branches: readonly BranchListItem[]): CompanyListItem[] {
  const counts = new Map<string, { item: CompanyListItem; branchCount: number }>();

  branches.forEach((branch) => {
    const companyId = branch.companyId;
    if (companyId === '' || companyId == null) return;

    const key = String(companyId);
    const existing = counts.get(key);
    if (existing) {
      existing.branchCount += 1;
      if (branch.companyName?.trim()) {
        existing.item.name = branch.companyName.trim();
      }
      return;
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
  });

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
  const { organizationId, companyId, session, role, authScope, scope } = input;

  const directoryScope = scope ?? (companyId != null ? 'company' : 'organization');
  const directoryContext = { role, authScope, scope: directoryScope };

  const branches = await loadBranchDirectory(
    organizationId,
    companyId,
    get,
    directoryContext,
  ).catch(() => []);

  const mayListAllCompanies = shouldLoadOrganizationCompanyList({
    role,
    authScope,
    companyId: null,
    scope: 'organization',
  });

  let companies: CompanyListItem[] = [];
  if (companyId != null && !mayListAllCompanies) {
    const detail = await loadCompanyById(companyId, get).catch(() => null);
    if (detail) companies = [detail];
  } else if (companyId == null && organizationId != null && mayListAllCompanies) {
    companies = await loadOrganizationCompanies(organizationId, get, {
      role,
      authScope,
      scope: 'organization',
    }).catch(() => []);
  } else if (companyId != null) {
    const detail = await loadCompanyById(companyId, get).catch(() => null);
    if (detail) companies = [detail];
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

export type CreateUserDirectoryAuth = {
  role?: string | null;
  authScope?: string | null;
};

export async function resolveCreateUserRequestContext(
  names: CreateUserNameHints,
  ids: CreateUserIdHints,
  get: GetJson,
  roleCatalog: readonly RoleCatalogItem[] = [],
  roleCode?: string,
  directoryAuth?: CreateUserDirectoryAuth,
): Promise<CreateUserRequestContext> {
  const needsBranch = roleCode ? roleRequiresBranchId(roleCode, roleCatalog) : false;
  const organizationId = ids.organizationId;
  if (organizationId == null || !Number.isFinite(organizationId)) {
    throw new Error('Organization is required to create a user.');
  }

  let companyId = normalizeId(ids.companyId);
  let branchId = normalizeId(ids.branchId);

  const mayListAllCompanies = shouldLoadOrganizationCompanyList({
    role: directoryAuth?.role,
    authScope: directoryAuth?.authScope,
    companyId: null,
    scope: 'organization',
  });

  let companies: CompanyListItem[] = [];
  if (mayListAllCompanies) {
    companies = await loadOrganizationCompanies(organizationId, get, {
      role: directoryAuth?.role,
      authScope: directoryAuth?.authScope,
      scope: 'organization',
    }).catch(() => []);
  } else if (companyId != null) {
    const detail = await loadCompanyById(companyId, get).catch(() => null);
    if (detail) companies = [detail];
  }

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
    branchId =
      normalizeId(
        branches.find(
          (branch) =>
            branch.name?.trim().toLowerCase() === branchName.toLowerCase() ||
            String(branch.id) === branchName,
        )?.id,
      ) ?? normalizeId(branchName);
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

  const needsCompany = roleCode ? roleRequiresCompanyId(roleCode, roleCatalog) : true;

  if (needsCompany && companyId == null) {
    throw new Error('Company is required for company- and branch-scoped roles.');
  }

  if (needsBranch && branchId == null) {
    throw new Error('Branch is required for branch-scoped roles.');
  }

  return {
    organizationId,
    ...(companyId != null ? { companyId } : {}),
    ...(branchId != null ? { branchId } : {}),
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

function normalizePermissionMatchKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s.-]+/g, '_');
}

export function autoEnableRolePermissions(
  categories: readonly PermissionCategory[],
  assignedKeys: Set<string>,
): PermissionCategory[] {
  return categories.map((category) => ({
    ...category,
    permissions: category.permissions.map((perm) => {
      const permCode = perm.code || perm.id;
      const permCandidates = [perm.id, permCode, perm.name].map(normalizePermissionMatchKey);
      const isAssigned =
        assignedKeys.has(perm.id) ||
        assignedKeys.has(perm.id.toLowerCase()) ||
        assignedKeys.has(perm.name) ||
        assignedKeys.has(perm.name.toLowerCase()) ||
        assignedKeys.has(permCode) ||
        assignedKeys.has(permCode.toLowerCase()) ||
        [...assignedKeys].some((key) => {
          const normalized = normalizePermissionMatchKey(key);
          return permCandidates.some(
            (candidate) =>
              candidate === normalized ||
              candidate.endsWith(`_${normalized}`) ||
              normalized.endsWith(`_${candidate}`),
          );
        });

      return {
        ...perm,
        enabled: isAssigned,
      };
    }),
  }));
}

export function togglePermissionCategory(
  categories: readonly PermissionCategory[],
  categoryId: string,
  permissionId: string,
): PermissionCategory[] {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return {
      ...cat,
      permissions: cat.permissions.map((p) =>
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p,
      ),
    };
  });
}

export function toggleAllInCategory(
  categories: readonly PermissionCategory[],
  categoryId: string,
  enableAll: boolean,
): PermissionCategory[] {
  return categories.map((cat) => {
    if (cat.id !== categoryId) return cat;
    return {
      ...cat,
      permissions: cat.permissions.map((p) => ({ ...p, enabled: enableAll })),
    };
  });
}

export async function resolveAssignmentPermissionsPayload(
  userId: number | string,
  userRoleId: number | string,
  categories: readonly PermissionCategory[],
  get: (path: string) => Promise<unknown>,
): Promise<{
  permission_codes: string[];
  permission_ids: string[];
  assignment_adjustments: Array<{ permission_code: string; effect: 'grant' | 'revoke' }>;
}> {
  let inheritedCodes: string[] = [];
  try {
    const raw = await get(userRolePermissionsPath(userId, userRoleId));
    const parsed = rolePermissionsPayloadSchema.safeParse(unwrapEnvelope(raw));
    if (parsed.success) {
      const payload: RolePermissionsPayload = parsed.data;
      inheritedCodes = payload.inherited_permission_codes;
    }
  } catch {
    // If GET permissions endpoint fails, fallback to empty list
  }

  const enabledFromUI = new Set<string>();
  const disabledFromUI = new Set<string>();

  categories.forEach((cat) => {
    cat.permissions.forEach((perm) => {
      const code = perm.code || perm.id;
      if (perm.enabled) {
        enabledFromUI.add(code);
      } else {
        disabledFromUI.add(code);
      }
    });
  });

  const adjustments: Array<{ permission_code: string; effect: 'grant' | 'revoke' }> = [];
  const inheritedSet = new Set<string>(inheritedCodes);
  const hasInheritedBaseline = inheritedSet.size > 0;

  enabledFromUI.forEach((code) => {
    // Without a baseline, every UI toggle would look like a new grant and the backend
    // rejects grants the actor does not hold (delegation rule).
    if (!hasInheritedBaseline) return;
    if (!inheritedSet.has(code)) {
      adjustments.push({ permission_code: code, effect: 'grant' });
    }
  });

  disabledFromUI.forEach((code) => {
    if (!hasInheritedBaseline) return;
    if (inheritedSet.has(code)) {
      adjustments.push({ permission_code: code, effect: 'revoke' });
    }
  });

  const permissionCodesList = hasInheritedBaseline ? Array.from(enabledFromUI) : [];

  return {
    permission_codes: permissionCodesList,
    permission_ids: permissionCodesList,
    assignment_adjustments: adjustments,
  };
}

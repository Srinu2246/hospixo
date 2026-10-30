import { resolveSidebarRoute, type SidebarContext } from '@/app/sidebar';
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
  type UserRoleItem,
  isMatch,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { ScopeType } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type { QueryParams } from '@/services/api/types';
import type { JsonValue } from '@/types/json';
import { userRolePermissionsPath } from '@/services/api/ApiUrlsV1';

type GetJson = (path: string, params?: QueryParams) => Promise<JsonValue>;

/** Split display name for grid cells (first / last with spacing). */
export function userDisplayNameParts(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: 'User', last: '' };
}

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

/** Branch label: user/draft input first, then session, then name from branch catalog API. */
export function resolveSessionBranchDisplay(hints: {
  formBranch?: string | null;
  contextBranchName?: string | null;
  accountBranchName?: string | null;
  catalogBranchName?: string | null;
}): string {
  for (const value of [
    hints.formBranch,
    hints.contextBranchName,
    hints.accountBranchName,
    hints.catalogBranchName,
  ]) {
    const trimmed = value?.trim();
    if (trimmed && !isFallbackEntityName(trimmed)) return trimmed;
  }
  return '';
}

/** Branch-bound sessions must not load company lists or company-by-id (403 on branch tokens). */
export function isBranchAuthenticatedSession(input: {
  authScope?: string | null;
  accountBranchId?: number | null;
}): boolean {
  const scope = input.authScope?.toLowerCase();
  if (scope === 'branch') return true;
  if (input.accountBranchId == null) return false;
  return scope !== 'company' && scope !== 'organization';
}

/** Company-scoped logins load one company; org admins load the full directory on org routes. */
export function resolveEmployeeDirectoryOptions(input: {
  wizardScope: ScopeType;
  contextCompanyId?: number;
  accountCompanyId?: number;
  accountBranchId?: number;
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

  if (
    input.wizardScope === 'branch' ||
    isBranchAuthenticatedSession({
      authScope: input.authScope,
      accountBranchId: input.accountBranchId,
    })
  ) {
    return {
      companyId: undefined,
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

/** Check if an entity name is a dummy placeholder or fallback string. */
export function isFallbackEntityName(name?: string | null): boolean {
  if (!name) return true;
  const trimmed = name.trim();
  if (
    !trimmed ||
    trimmed === '—' ||
    trimmed === '-' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'null'
  ) {
    return true;
  }
  if (/^(company|branch)\s*(#|\d)/i.test(trimmed)) {
    return true;
  }
  if (trimmed === 'Downtown Branch') {
    return true;
  }
  if (/^\d+$/.test(trimmed)) {
    return true;
  }
  return false;
}

/** Client-generated or synthetic emails — hide in UI and profile. */
export function isPlaceholderEmail(email?: string | null): boolean {
  if (!email?.trim()) return true;
  const normalized = email.trim().toLowerCase();
  if (normalized.endsWith('@hospixo.local')) return true;
  if (/^user_\d+@hospixo\.com$/.test(normalized)) return true;
  return false;
}

/** Replace API company id tokens with a resolved display name when available. */
export function enrichUserListCompanyNames(
  users: readonly UserRoleItem[],
  hints?: {
    companyName?: string;
    companies?: readonly Pick<CompanyListItem, 'id' | 'name'>[];
  },
): UserRoleItem[] {
  if (users.length === 0) return [...users];

  const fallbackName =
    hints?.companyName?.trim() && !isFallbackEntityName(hints.companyName)
      ? hints.companyName.trim()
      : undefined;
  const companies = hints?.companies ?? [];

  return users.map((user) => {
    const current = user.company?.trim();
    if (current && !isFallbackEntityName(current)) {
      return user;
    }

    if (user.companyId != null && companies.length > 0) {
      const matched = companies.find((company) => String(company.id) === String(user.companyId));
      if (matched?.name?.trim() && !isFallbackEntityName(matched.name)) {
        return { ...user, company: matched.name.trim() };
      }
    }

    if (fallbackName) {
      return { ...user, company: fallbackName };
    }

    return user.company && isFallbackEntityName(user.company)
      ? { ...user, company: undefined }
      : user;
  });
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
    const byCompanyId = branches.filter(
      (branch) => String(branch.companyId) === String(directoryCompanyId),
    );
    if (byCompanyId.length > 0) {
      filtered = byCompanyId;
    } else if (activeCompany.length > 0) {
      const byCompanyName = branches.filter((branch) => {
        if (normalizeLabel(branch.companyName) === activeCompany) return true;
        if (matchedCompany && String(branch.companyId) === String(matchedCompany.id)) return true;
        return false;
      });
      if (byCompanyName.length > 0) {
        filtered = byCompanyName;
      }
    }
  }

  const names = filtered.map((branch) => branch.name).filter(Boolean);
  const selected = selectedBranchName?.trim();
  if (selected && !names.includes(selected)) {
    const selectedBranch = branches.find((branch) => branch.name.trim() === selected);
    if (selectedBranch) {
      names.push(selectedBranch.name);
    } else if (!isFallbackEntityName(selected)) {
      names.push(selected);
    }
  }

  return names;
}

export function companiesFromBranches(branches: readonly BranchListItem[]): CompanyListItem[] {
  const counts = new Map<string, { item: CompanyListItem; branchCount: number }>();

  branches.forEach((branch) => {
    const companyId = branch.companyId;
    if (companyId == null) return;

    const key = String(companyId);
    const existing = counts.get(key);
    if (existing) {
      existing.branchCount += 1;
      if (branch.companyName.trim()) {
        existing.item.name = branch.companyName.trim();
      }
      return;
    }

    counts.set(key, {
      branchCount: 1,
      item: {
        id: companyId,
        name: branch.companyName.trim() || `Company #${companyId}`,
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

/** Prefer company directory name over branch payload placeholders (e.g. Company #94). */
export function resolveCompanyLabelForBranch(
  branch: BranchListItem | undefined,
  companies: readonly CompanyListItem[] | undefined,
): string | undefined {
  if (!branch) return undefined;

  if (branch.companyId != null && companies?.length) {
    const matched = companies.find((company) => String(company.id) === String(branch.companyId));
    if (matched?.name?.trim() && !isFallbackEntityName(matched.name)) {
      return matched.name.trim();
    }
  }

  if (branch.companyName?.trim() && !isFallbackEntityName(branch.companyName)) {
    return branch.companyName.trim();
  }

  return undefined;
}

async function enrichCompaniesWithDetails(
  companies: CompanyListItem[],
  get: GetJson,
): Promise<CompanyListItem[]> {
  let next = [...companies];
  const fallbackIds = [
    ...new Set(
      next.filter((company) => isFallbackEntityName(company.name)).map((company) => company.id),
    ),
  ];

  await Promise.all(
    fallbackIds.map(async (id) => {
      const detail = await loadCompanyById(id, get).catch(() => null);
      if (detail) {
        next = next.map((company) => (String(company.id) === String(id) ? detail : company));
      }
    }),
  );

  return next;
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
  if (branchId != null) {
    const existingIndex = nextBranches.findIndex(
      (branch) => String(branch.id) === String(branchId),
    );
    if (existingIndex >= 0) {
      const existing = nextBranches[existingIndex];
      if (
        isFallbackEntityName(existing.name) &&
        hints.branchName?.trim() &&
        !isFallbackEntityName(hints.branchName)
      ) {
        nextBranches[existingIndex] = {
          ...existing,
          name: hints.branchName.trim(),
        };
      }
    } else {
      const hasRealBranchName = hints.branchName?.trim() && !isFallbackEntityName(hints.branchName);
      if (nextBranches.length === 0 || hasRealBranchName) {
        const resolvedCompanyId =
          typeof companyId === 'number'
            ? companyId
            : typeof companyId === 'string' && Number.isFinite(Number(companyId))
              ? Number(companyId)
              : 0;
        const resolvedBranchId =
          typeof branchId === 'number'
            ? branchId
            : typeof branchId === 'string' && Number.isFinite(Number(branchId))
              ? Number(branchId)
              : 0;

        nextBranches = [
          ...nextBranches,
          {
            id: resolvedBranchId,
            name: hasRealBranchName ? hints.branchName!.trim() : `Branch #${branchId}`,
            companyId: resolvedCompanyId,
            companyName: hints.companyName?.trim() || `Company #${resolvedCompanyId}`,
            code: String(branchId),
            city: '—',
            status: 'active',
            isDefault: false,
            userCount: 0,
          },
        ];
      }
    }
  }

  return { companies: nextCompanies, branches: nextBranches };
}

export async function loadEmployeeDirectory(
  input: LoadEmployeeDirectoryInput,
  get: GetJson,
): Promise<EmployeeDirectoryData> {
  const { organizationId, companyId, session, role, authScope, scope } = input;

  const directoryScope = scope ?? (companyId != null ? 'company' : 'organization');
  const isBranchScope = directoryScope === 'branch';
  const isBranchAuth = isBranchAuthenticatedSession({
    authScope,
    accountBranchId: session.branchId,
  });
  // Branch-authenticated users must not hit company/branch list or company detail APIs.
  if (isBranchAuth) {
    return enrichDirectoryWithSession([], [], {
      companyId: companyId ?? session.companyId,
      companyName: session.companyName,
      branchId: session.branchId,
      branchName: session.branchName,
    });
  }

  const sessionBranchName = session.branchName?.trim();
  const hasSessionBranch =
    session.branchId != null &&
    Boolean(sessionBranchName) &&
    !isFallbackEntityName(sessionBranchName);

  if (isBranchScope && hasSessionBranch) {
    return enrichDirectoryWithSession([], [], {
      companyId: companyId ?? session.companyId,
      companyName: session.companyName,
      branchId: session.branchId,
      branchName: sessionBranchName,
    });
  }

  const directoryContext = { role, authScope, scope: directoryScope };

  const branches = await loadBranchDirectory(
    organizationId,
    companyId,
    get,
    directoryContext,
  ).catch(() => []);

  const mayListAllCompanies =
    !isBranchScope &&
    shouldLoadOrganizationCompanyList({
      role,
      authScope,
      companyId: null,
      scope: directoryScope,
    });

  let companies: CompanyListItem[] = [];
  const resolvedCompanyId =
    companyId ??
    session.companyId ??
    (isBranchScope && session.branchId != null
      ? branches.find((branch) => String(branch.id) === String(session.branchId))?.companyId
      : undefined) ??
    (isBranchScope ? branches[0]?.companyId : undefined);

  if (isBranchScope) {
    companies = branches.length > 0 ? companiesFromBranches(branches) : [];
    const sessionCompanyLabel =
      session.companyName?.trim() && !isFallbackEntityName(session.companyName)
        ? session.companyName.trim()
        : undefined;
    if (sessionCompanyLabel && resolvedCompanyId != null) {
      const hasCompany = companies.some((c) => String(c.id) === String(resolvedCompanyId));
      companies = hasCompany
        ? companies.map((c) =>
            String(c.id) === String(resolvedCompanyId) ? { ...c, name: sessionCompanyLabel } : c,
          )
        : [
            ...companies,
            {
              id: resolvedCompanyId,
              name: sessionCompanyLabel,
              code: null,
              businessType: null,
              status: 'active' as const,
              branchCount: branches.length,
              userCount: 0,
            },
          ];
    }
  } else if (!isBranchScope) {
    if (companyId == null && organizationId != null && mayListAllCompanies) {
      companies = await loadOrganizationCompanies(organizationId, get, {
        role,
        authScope,
        scope: directoryScope,
      }).catch(() => []);
    } else if (companyId != null) {
      const fromBranches = branches.length > 0 ? companiesFromBranches(branches) : [];
      const matched = fromBranches.find((c) => String(c.id) === String(companyId));
      if (matched && !isFallbackEntityName(matched.name)) {
        companies = [matched];
      } else {
        const detail = await loadCompanyById(companyId, get).catch(() => null);
        if (detail) {
          companies = [detail];
        } else if (matched) {
          companies = [matched];
        }
      }
    }
  }

  if (!isBranchScope && companies.length === 0 && branches.length > 0) {
    companies = companiesFromBranches(branches);
  }

  if (!isBranchScope) {
    companies = await enrichCompaniesWithDetails(companies, get);
  }

  const branchScopedBranch =
    isBranchScope && session.branchId != null
      ? branches.find((branch) => String(branch.id) === String(session.branchId))
      : undefined;
  const branchScopedCompanyName = resolveCompanyLabelForBranch(branchScopedBranch, companies);
  const directoryCompanyName = companies.find(
    (c) => String(c.id) === String(resolvedCompanyId),
  )?.name;
  const resolvedSessionCompanyName =
    session.companyName && !isFallbackEntityName(session.companyName)
      ? session.companyName
      : branchScopedCompanyName && !isFallbackEntityName(branchScopedCompanyName)
        ? branchScopedCompanyName.trim()
        : directoryCompanyName && !isFallbackEntityName(directoryCompanyName)
          ? directoryCompanyName
          : undefined;

  return enrichDirectoryWithSession(companies, branches, {
    companyId: companyId ?? session.companyId,
    companyName: resolvedSessionCompanyName,
    branchId: session.branchId,
    branchName: session.branchName,
  });
}

export type CreateUserDirectoryAuth = {
  role?: string | null;
  authScope?: string | null;
  scope?: ScopeType;
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
  const organizationId =
    ids.organizationId != null && Number.isFinite(ids.organizationId) ? ids.organizationId : 1;

  let companyId = normalizeId(ids.companyId);
  let branchId = normalizeId(ids.branchId);

  const wizardBranchScope =
    directoryAuth?.scope === 'branch' || directoryAuth?.authScope === 'branch';

  const isBranchScope = needsBranch && (wizardBranchScope || ids.branchId != null);

  const mayListAllCompanies =
    !wizardBranchScope &&
    !isBranchScope &&
    shouldLoadOrganizationCompanyList({
      role: directoryAuth?.role,
      authScope: directoryAuth?.authScope,
      companyId: null,
      scope: isBranchScope ? 'branch' : 'organization',
    });

  let companies: CompanyListItem[] = [];
  if (!wizardBranchScope && !isBranchScope) {
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
  }

  const branches = await loadOrganizationBranches(
    organizationId,
    companies,
    get,
    companyId ?? undefined,
  ).catch(() => []);

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

  // Branch-bound company resolution: if branchId or branch name is known,
  // align companyId with the branch's actual parent companyId
  if (branchId != null) {
    const matchedBranch = branches.find((branch) => normalizeId(branch.id) === branchId);
    if (matchedBranch?.companyId != null) {
      companyId = normalizeId(matchedBranch.companyId);
    }
  } else if (names.branch?.trim()) {
    const matchedBranch = branches.find(
      (branch) => branch.name?.trim().toLowerCase() === names.branch?.trim().toLowerCase(),
    );
    if (matchedBranch?.companyId != null) {
      companyId = normalizeId(matchedBranch.companyId);
    }
  }

  if (companyId == null && names.company?.trim()) {
    companyId = normalizeId(
      companies.find((company) => company.name === names.company?.trim())?.id,
    );
  }

  if (!names.company?.trim() && companyId != null) {
    const matchedCompany = companies.find((c) => normalizeId(c.id) === companyId);
    if (matchedCompany?.name) {
      names.company = matchedCompany.name;
    }
  }

  const needsCompany = roleCode ? roleRequiresCompanyId(roleCode, roleCatalog) : true;

  if (needsCompany && companyId == null) {
    companyId = normalizeId(companies[0]?.id);
  }

  if (!needsBranch) {
    branchId = undefined;
  } else if (branchId == null) {
    branchId = normalizeId(branches[0]?.id);
  }

  return {
    organizationId,
    ...(companyId != null ? { companyId } : {}),
    ...(needsBranch && branchId != null ? { branchId } : {}),
    roleCatalog,
    ...(roleCode ? { roleCode } : {}),
  };
}

function normalizeId(value: JsonValue | undefined): number | undefined {
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
  get: (path: string) => Promise<JsonValue>,
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

/** Human-readable role label for menus and profile headers. */
export function formatStaffProfileRoleLabel(role?: string | null): string {
  const value = (role ?? '').trim();
  if (!value) return 'User';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/** Canonical `…/employees/users-and-roles/profile?id=` URL for the signed-in user. */
export function buildStaffProfileHref(
  userId: number | string,
  options: {
    role: string;
    context?: SidebarContext;
  },
): string {
  const { role, context = {} } = options;
  const profilePath = resolveSidebarRoute(
    '/branch-manager/employees/users-and-roles/profile',
    context,
    role,
  );
  return `${profilePath}?id=${encodeURIComponent(String(userId))}`;
}

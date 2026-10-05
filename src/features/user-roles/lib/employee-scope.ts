import type { AccessLevel } from '@/lib/auth/access-level';
import type { TeamUser } from '@/features/user-roles/config/users';

/** Mock active branch when viewing `/branch/staff`. */
export const DEFAULT_BRANCH_CONTEXT = 'Downtown HQ';

export type FilterEmployeesOptions = Readonly<{
  activeBranch?: string;
  activeBranchId?: number | null;
  activeCompanyId?: number | null;
}>;

export function filterEmployeesByAccessLevel(
  users: readonly TeamUser[],
  level: AccessLevel,
  options?: FilterEmployeesOptions,
): TeamUser[] {
  switch (level) {
    case 'organisation':
      return [...users];
    case 'company':
      return users.filter((user) => {
        if (user.scope !== 'company' && user.scope !== 'branch') return false;
        if (options?.activeCompanyId != null && user.companyId != null) {
          return user.companyId === options.activeCompanyId;
        }
        return true;
      });
    case 'branch':
    case 'captain':
    default:
      return users.filter((user) => {
        if (user.scope !== 'branch') return false;

        if (options?.activeBranchId != null) {
          if (user.branchId != null) {
            return user.branchId === options.activeBranchId;
          }
          if (user.branch === `Branch ${options.activeBranchId}`) {
            return true;
          }
          return false;
        }

        const hasMockBranches = users.some((u) => u.branch === DEFAULT_BRANCH_CONTEXT);
        const activeBranch =
          options?.activeBranch ?? (hasMockBranches ? DEFAULT_BRANCH_CONTEXT : undefined);

        if (activeBranch && activeBranch !== 'All Branches' && activeBranch !== 'All Outlets') {
          const needle = activeBranch.toLowerCase();
          const haystack = user.branch.toLowerCase();
          return haystack === needle || haystack.includes(needle) || needle.includes(haystack);
        }

        return true;
      });
  }
}

export function getScopedBranchOptions(level: AccessLevel, users: readonly TeamUser[]): string[] {
  const scoped = filterEmployeesByAccessLevel(users, level);
  const branches = new Set(scoped.map((user) => user.branch));
  return [...branches].sort();
}

export function computeEmployeeStats(users: readonly TeamUser[]) {
  return {
    totalUsers: users.length,
    activeNow: users.filter((user) => user.status === 'active').length,
    pendingInvites: users.filter((user) => user.status === 'invited').length,
    userRoles: new Set(users.map((user) => user.role)).size,
  };
}

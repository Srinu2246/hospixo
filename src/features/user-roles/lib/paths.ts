import type { AccessLevel } from '@/lib/auth/access-level';
import { routes } from '@/config/routes';

const USERS_ROLES_SHELL_PREFIXES = [
  routes.platform.employees.organisation,
  routes.platform.employees.company,
  routes.platform.employees.branch,
  '/employees',
  '/roles',
] as const;

/** Routes wrapped by UsersRolesShell — main chrome padding is omitted. */
export function isUsersRolesShellPath(pathname: string): boolean {
  return USERS_ROLES_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Single Users & Roles page URL for the active hierarchy level. */
export function employeesListPath(level: AccessLevel): string {
  switch (level) {
    case 'organisation':
      return routes.platform.employees.organisation;
    case 'company':
      return routes.platform.employees.company;
    case 'branch':
      return routes.platform.employees.branch;
    default:
      return routes.platform.employees.company;
  }
}

/** @deprecated Roles live on the Users & Roles page — same as employeesListPath. */
export function rolesListPath(level: AccessLevel): string {
  return employeesListPath(level);
}

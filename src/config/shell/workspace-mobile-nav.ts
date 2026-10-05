import type { ElementType } from 'react';
import { BarChart3, CreditCard, LayoutGrid, UserRound } from 'lucide-react';

import { employeesListPath } from '@/features/user-roles/lib/paths';
import type { AccessLevel } from '@/lib/auth/access-level';
import { routes } from '@/config/routes';

export type WorkspaceMobileNavId = 'dashboard' | 'staff' | 'finance' | 'reports' | 'profile';

export type WorkspaceMobileNavItem = Readonly<{
  id: WorkspaceMobileNavId;
  label: string;
  href: string;
  icon: ElementType;
  /** Extra path prefixes that should mark this tab active. */
  matchPrefixes?: readonly string[];
}>;

function dashboardHref(level: AccessLevel): string {
  switch (level) {
    case 'organisation':
      return routes.dashboard.organisation;
    case 'branch':
      return routes.dashboard.branch;
    default:
      return routes.dashboard.company;
  }
}

/** Primary mobile bottom navigation for workspace / Users & Roles flows. */
export function getWorkspaceMobileNav(level: AccessLevel): readonly WorkspaceMobileNavItem[] {
  const staffHref = employeesListPath(level);

  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: dashboardHref(level),
      icon: LayoutGrid,
    },
    {
      id: 'staff',
      label: 'Staff',
      href: staffHref,
      icon: UserRound,
      matchPrefixes: ['/employees', '/roles', staffHref],
    },
    {
      id: 'finance',
      label: 'Finance',
      href: routes.dashboard.finance,
      icon: CreditCard,
    },
    {
      id: 'reports',
      label: 'Reports',
      href: routes.dashboard.reports,
      icon: BarChart3,
      matchPrefixes: [routes.dashboard.analytics],
    },
    {
      id: 'profile',
      label: 'Profile',
      href: routes.dashboard.settings,
      icon: UserRound,
    },
  ] as const;
}

export type WorkspaceMobileTopbarContext = Readonly<{
  eyebrow: string;
  title: string;
}>;

/** Title row for the mobile workspace topbar on Users & Roles routes. */
export function getWorkspaceMobileTopbarContext(
  pathname: string,
  level: AccessLevel,
): WorkspaceMobileTopbarContext {
  if (pathname.includes('/employees') || pathname.includes('/roles')) {
    return { eyebrow: 'USERS & ROLES', title: 'Staff' };
  }

  switch (level) {
    case 'organisation':
      return { eyebrow: 'ORGANISATION', title: 'Dashboard' };
    case 'branch':
      return { eyebrow: 'BRANCH', title: 'Dashboard' };
    default:
      return { eyebrow: 'COMPANY', title: 'Dashboard' };
  }
}

export function isWorkspaceMobileNavActive(
  pathname: string,
  item: WorkspaceMobileNavItem,
): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
    return true;
  }

  return (item.matchPrefixes ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

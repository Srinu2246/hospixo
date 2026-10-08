import { accessSidebars, type AccessNavItem } from '@/config/shell/access-navigation';
import {
  getUnderConstructionRoute,
  type UnderConstructionRouteDef,
} from '@/config/shell/under-construction-routes';
import { platformPosRoutes, routes } from '@/config/routes';

export type WorkspaceNavPageDef = Readonly<{
  title: string;
  subtitle?: string;
}>;

/** Paths that have their own `page.tsx` (not handled by the catch-all). */
export const workspaceDedicatedPaths = new Set<string>([
  routes.dashboard.organisation,
  routes.dashboard.company,
  routes.dashboard.branch,
  routes.dashboard.profile,
  routes.dashboard.floors,
  routes.dashboard.floorCreate,
  routes.platform.employees.organisation,
  routes.platform.employees.company,
  routes.platform.employees.branch,
  '/organisation/companies',
  '/organisation/branches',
  '/company/branches',
  '/branches',
]);

function collectNavItems(): Map<string, WorkspaceNavPageDef> {
  const map = new Map<string, WorkspaceNavPageDef>();

  const configs = Object.values(accessSidebars);

  for (const config of configs) {
    for (const group of config.groups) {
      for (const item of group.items) {
        registerItem(map, item, group.label);
      }
    }
  }

  return map;
}

function registerItem(
  map: Map<string, WorkspaceNavPageDef>,
  item: AccessNavItem,
  groupLabel?: string,
) {
  const path = item.href.replace(/\/$/, '') || '/';
  if (!map.has(path)) {
    map.set(path, {
      title: item.label,
      subtitle: groupLabel ? `${groupLabel} · ${configTitleForPath(path)}` : undefined,
    });
  }
}

function configTitleForPath(path: string): string {
  if (path.startsWith(routes.dashboard.captain)) return 'Captain';
  if (path.startsWith(routes.dashboard.cashier)) return 'Cashier';
  if (path.startsWith(routes.dashboard.kitchen)) return 'Kitchen';
  if (path.startsWith(routes.dashboard.branch)) return 'Branch';
  if (path.startsWith(routes.dashboard.company)) return 'Company';
  return 'Workspace';
}

const navItemByPath = collectNavItems();

const tenantWorkspacePrefixRoots = [
  ...new Set([
    ...Object.values(routes.dashboard),
    ...platformPosRoutes,
    routes.platform.employees.organisation,
    routes.platform.employees.company,
    routes.platform.employees.branch,
    routes.platform.branches,
    routes.platform.reports,
    routes.platform.inventory,
    routes.platform.settings,
    '/employees',
    '/roles',
  ]),
] as const;

const controlPlanePrefixes = [
  '/organizations',
  '/companies',
  '/subscriptions',
  '/onboarding',
  '/support',
  '/system-health',
  '/feature-flags',
  '/plans',
  '/products',
  '/payments',
  '/invoices',
  '/release-management',
  '/security',
] as const;

/** True when a URL belongs to the tenant workspace (not control plane / marketing). */
export function isTenantWorkspacePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/';

  if (
    controlPlanePrefixes.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    )
  ) {
    return false;
  }

  if (navItemByPath.has(normalized)) return true;

  for (const href of navItemByPath.keys()) {
    if (normalized.startsWith(`${href}/`)) return true;
  }

  return tenantWorkspacePrefixRoots.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function resolveWorkspaceNavPage(pathname: string): WorkspaceNavPageDef | undefined {
  const normalized = pathname.replace(/\/$/, '') || '/';

  if (workspaceDedicatedPaths.has(normalized)) {
    return undefined;
  }

  const explicit: UnderConstructionRouteDef | undefined = getUnderConstructionRoute(normalized);
  if (explicit) {
    return explicit;
  }

  const fromNav = navItemByPath.get(normalized);
  if (fromNav) {
    return fromNav;
  }

  if (!isTenantWorkspacePath(normalized)) {
    return undefined;
  }

  return {
    title: titleFromPath(normalized),
    subtitle: 'This screen is not available yet.',
  };
}

function titleFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'Page';
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

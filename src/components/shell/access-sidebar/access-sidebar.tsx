'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, CornerUpLeft, UserRound } from 'lucide-react';

import { LogoMark } from '@/components/common/brand/logo-mark';
import { mobileNavStyles, SidebarCloseButton } from '@/components/shell/mobile-nav';
import { siteConfig } from '@/config/site';
import {
  branchPosSidebar,
  getAccessSidebar,
  type AccessNavGroup,
  type AccessSidebarConfig,
} from '@/config/shell/access-navigation';
import { isPlatformPosRoute, routes } from '@/config/routes';
import {
  resolveAccessLevel,
  resolveHierarchyEscape,
  resolveHierarchyHomePath,
  resolvePosWorkspaceEscape,
  resolveHierarchyLevelFromPath,
  resolveSidebarLevel,
  type AccessLevel,
  type HierarchyAccessLevel,
} from '@/lib/auth/access-level';
import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';

import styles from './access-sidebar.module.css';

const COLLAPSED_STORAGE_KEY = 'hospixo.access-sidebar.collapsed';
const NAV_SCOPE_STORAGE_KEY = 'hospixo.nav.scope';

/** List-page hrefs for the single Users & Roles nav item. */
const USERS_ROLES_HREFS = new Set<string>([
  routes.platform.employees.organisation,
  routes.platform.employees.company,
  routes.platform.employees.branch,
]);

function readNavScope(): HierarchyAccessLevel | null {
  try {
    const value = sessionStorage.getItem(NAV_SCOPE_STORAGE_KEY);
    if (value === 'organisation' || value === 'company' || value === 'branch') {
      return value;
    }
  } catch {
    /* ignore private-mode storage errors */
  }
  return null;
}

function writeNavScope(scope: HierarchyAccessLevel) {
  try {
    sessionStorage.setItem(NAV_SCOPE_STORAGE_KEY, scope);
  } catch {
    /* ignore */
  }
}

type AccessSidebarProps = Readonly<{
  /** When set, forces this sidebar (e.g. company route while org user drills in). */
  level?: AccessLevel;
  config?: AccessSidebarConfig;
  open?: boolean;
  onClose?: () => void;
}>;

function isUsersRolesWizardPath(pathname: string) {
  return (
    pathname === '/roles' ||
    pathname.startsWith('/roles/') ||
    pathname === '/employees' ||
    pathname.startsWith('/employees/')
  );
}

function isItemActive(pathname: string, href: string, homeHref: string) {
  if (pathname === href) return true;
  if (href === homeHref) return false;
  if (pathname.startsWith(`${href}/`)) return true;
  // Keep Users & Roles highlighted through create-role / add-user wizards.
  if (USERS_ROLES_HREFS.has(href) && isUsersRolesWizardPath(pathname)) {
    return true;
  }
  return false;
}

function groupHasActiveItem(pathname: string, group: AccessNavGroup, homeHref: string) {
  return group.items.some((item) => isItemActive(pathname, item.href, homeHref));
}

export function AccessSidebar({
  level,
  config: configProp,
  open = false,
  onClose,
}: AccessSidebarProps) {
  const pathname = usePathname() ?? '';
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [navScope, setNavScope] = useState<HierarchyAccessLevel | null>(null);

  const pathHierarchyLevel = resolveHierarchyLevelFromPath(pathname);
  const resolvedNavScope = pathHierarchyLevel ?? navScope;

  useEffect(() => {
    // sessionStorage isn't reachable during SSR, so this state can only be
    // hydrated post-mount — an initializer can't do it, hence the effect.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-storage hydration, see comment above
      setCollapsed(sessionStorage.getItem(COLLAPSED_STORAGE_KEY) === '1');
    } catch {
      /* ignore private-mode storage errors */
    }
    if (!pathHierarchyLevel) {
      setNavScope(readNavScope());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only hydration
  }, []);

  useEffect(() => {
    if (!pathHierarchyLevel) return;
    writeNavScope(pathHierarchyLevel);
  }, [pathHierarchyLevel]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      try {
        sessionStorage.setItem(COLLAPSED_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // Ceiling from the signed-in user — never from a forced route level.
  const userCeiling = user
    ? resolveAccessLevel({
        roles: user.roles ?? [],
        scope: user.scope ?? 'tenant',
        company_id: user.company_id ?? null,
        branch_id: user.branch_id ?? null,
      })
    : 'company';

  // Route-aware chrome. Forced `level` pins captain/cashier flows.
  const resolvedLevel = level ?? resolveSidebarLevel(pathname, userCeiling, resolvedNavScope);

  const config =
    configProp ??
    (resolvedLevel === 'branch' && isPlatformPosRoute(pathname)
      ? branchPosSidebar
      : getAccessSidebar(resolvedLevel));
  const hierarchyEscape =
    resolveHierarchyEscape(userCeiling, resolvedLevel) ??
    resolvePosWorkspaceEscape(userCeiling, pathname);
  const brandHref = resolveHierarchyHomePath(userCeiling) ?? config.homeHref;
  const { width: logoWidth, height: logoHeight } = siteConfig.brand.logoDimensions;
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Profile';

  return (
    <aside
      className={cn(
        styles.sidebar,
        collapsed && !open && styles.sidebarCollapsed,
        mobileNavStyles.drawer,
        mobileNavStyles.drawerLeft,
        open && mobileNavStyles.drawerOpen,
      )}
      data-drawer-open={open ? 'true' : 'false'}
      data-access-chrome="sidebar"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className={styles.header}>
        <Link
          href={brandHref}
          className={styles.logoLink}
          aria-label={siteConfig.name}
          onClick={onClose}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
          <img
            src={siteConfig.brand.logoLight}
            alt=""
            width={logoWidth}
            height={logoHeight}
            className={styles.logoWordmark}
          />
          <LogoMark className={styles.logoMark} />
        </Link>
        <div className={styles.headerActions}>
          <SidebarCloseButton onClick={onClose} variant="dark" />
          <button
            type="button"
            className={styles.collapseButton}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapsed}
          >
            {collapsed ? (
              <ChevronRight className={styles.collapseIcon} aria-hidden="true" />
            ) : (
              <ChevronLeft className={styles.collapseIcon} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {hierarchyEscape ? (
        <div className={styles.escapeWrap}>
          <Link
            href={hierarchyEscape.href}
            className={styles.escapeLink}
            title={hierarchyEscape.label}
            onClick={onClose}
          >
            <CornerUpLeft className={styles.escapeIcon} aria-hidden="true" />
            <span className={styles.escapeLabel}>{hierarchyEscape.label}</span>
          </Link>
        </div>
      ) : null}

      <nav className={styles.content} aria-label={config.navAriaLabel}>
        {config.groups.map((group) => (
          <NavGroup
            key={group.id}
            group={group}
            pathname={pathname}
            homeHref={config.homeHref}
            collapsed={collapsed}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className={styles.footer}>
        <Link
          href={config.homeHref}
          className={styles.profileLink}
          title={displayName}
          onClick={onClose}
        >
          <span className={styles.avatar} aria-hidden="true">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span className={styles.profileText}>
            <span className={styles.profileName}>{displayName}</span>
            <span className={styles.profileRole}>{config.profileRole}</span>
          </span>
          <UserRound className={styles.profileExtraIcon} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

function NavGroup({
  group,
  pathname,
  homeHref,
  collapsed,
  onNavigate,
}: Readonly<{
  group: AccessNavGroup;
  pathname: string;
  homeHref: string;
  collapsed: boolean;
  onNavigate?: () => void;
}>) {
  const hasActive = groupHasActiveItem(pathname, group, homeHref);
  const [open, setOpen] = useState((group.defaultOpen ?? true) || hasActive);

  const isOpen = useMemo(() => {
    if (collapsed || !group.collapsible) return true;
    return open || hasActive;
  }, [collapsed, group.collapsible, open, hasActive]);

  let groupLabel: ReactNode = null;
  if (group.label && !collapsed) {
    groupLabel = group.collapsible ? (
      <button
        type="button"
        className={styles.groupToggle}
        aria-expanded={isOpen}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.groupLabel}>{group.label}</span>
        <ChevronDown
          className={cn(styles.groupChevron, isOpen && styles.groupChevronOpen)}
          aria-hidden="true"
        />
      </button>
    ) : (
      <p className={styles.staticGroupLabel}>{group.label}</p>
    );
  }

  return (
    <div className={styles.group}>
      {groupLabel}

      {isOpen ? (
        <div className={styles.menu}>
          {group.items.map((item) => (
            <NavLink
              key={item.id}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isItemActive(pathname, item.href, homeHref)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: Readonly<{
  href: string;
  label: string;
  icon: ElementType;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}>) {
  return (
    <Link
      href={href}
      className={cn(styles.navLink, active && styles.navLinkActive)}
      aria-current={active ? 'page' : undefined}
      title={label}
      onClick={onNavigate}
    >
      <Icon className={styles.navIcon} aria-hidden="true" />
      <span className={styles.navLabel}>{label}</span>
    </Link>
  );
}

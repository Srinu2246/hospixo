'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import type { SidebarContext, SidebarUserProfile } from '@/app/sidebar';
import { normalizeRoleKey } from '@/app/sidebar';
import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { formatStaffProfileRoleLabel } from '@/lib/helpers/employees/userRolesHelpers';
import { isCaptainWorkspacePath, POS_CAPTAIN_COMPACT_PADDING } from '@/lib/helpers/posCaptainFlow';
import { branchDashboardHref, companyDashboardHref } from '@/lib/helpers/routing/routingHelpers';
import { resolveTopNavbarLevel } from '@/lib/helpers';
import { useOrganizationCompanies } from '@/lib/hooks/organization/companies/useOrganizationCompanies';
import { useResolvedBranchName } from '@/lib/hooks/useResolvedBranchName';
import { useSessionBranchCatalog } from '@/lib/hooks/useSessionBranchCatalog';
import { screen } from '@/lib/theme/mui/breakpoints';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useThemeStore } from '@/stores/themeStore';

import { DesktopNavbar, MobileNavbar, TabletNavbar } from './top-navbar';

/**
 * Props for the root TopNavbar orchestrator.
 */
export interface TopNavbarProps {
  /** Active role key override (falls back to sidebar store role) */
  role?: string;
  /** Organizational context override (falls back to sidebar store context) */
  context?: SidebarContext;
  /** User profile override (falls back to sidebar store user) */
  user?: SidebarUserProfile;
  /** Triggered when the Notification icon is clicked */
  onNotificationClick?: () => void;
  /** Triggered when the mobile/tablet navigation menu button is clicked */
  onOpenMenu?: () => void;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

/**
 * TopNavbar
 *
 * Fixed, persistent top navigation bar for Organization, Company, and Branch levels.
 * Renders level-scoped Outlets selectors and action controls across mobile, tablet,
 * and desktop viewports with a layout offset ensuring page content is never covered.
 */
export function TopNavbar({
  role: propRole,
  context: propContext,
  user: propUser,
  onNotificationClick,
  onOpenMenu,
  sx,
}: Readonly<TopNavbarProps>) {
  const router = useRouter();
  const pathname = usePathname() ?? '';

  // Store subscriptions
  const storeRole = useSidebarStore((state) => state.role);
  const storeContext = useSidebarStore((state) => state.context);
  const setContext = useSidebarStore((state) => state.setContext);
  const storeUser = useSidebarStore((state) => state.user);
  const storeAccount = useSidebarStore((state) => state.account);
  const isOpen = useSidebarStore((state) => state.isOpen);

  const context = propContext ?? storeContext;
  const activeRole = propRole || storeRole;
  const activeUser = propUser || storeUser;
  const normalizedRole = normalizeRoleKey(activeRole);

  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  // Active level determination (Organization vs Company vs Branch)
  const level = resolveTopNavbarLevel(pathname, activeRole, context);
  const isBranchView = level === 'branch';

  // Captain workspace specific paths
  const captainWorkspacePath = isCaptainWorkspacePath(pathname);
  const showWaiterProfileNav = normalizedRole === 'waiter' && captainWorkspacePath;

  // Level 1: Organization-level companies
  const orgId =
    context.organizationId ??
    (typeof storeAccount?.org_id === 'number' ? storeAccount.org_id : undefined);
  const companiesQuery = useOrganizationCompanies(orgId, undefined, {
    enabled: level === 'organization',
  });
  const companies = useMemo(() => companiesQuery.data ?? [], [companiesQuery.data]);

  // Level 2: Company-level branches
  const branchCatalog = useSessionBranchCatalog({
    enabled: level === 'company',
  });
  const branches = useMemo(() => branchCatalog.branches, [branchCatalog.branches]);

  // Level 3: Branch-level resolved name
  const resolvedBranchName = useResolvedBranchName(context.branchName);
  const branchDisplayName =
    resolvedBranchName ||
    context.branchName?.trim() ||
    (context.branchId != null ? `Branch ${context.branchId}` : 'Branch');

  // Dropdown options for Organization level
  const companyOptions: DropdownOption<string>[] = useMemo(() => {
    const fromApi = companies.map((c) => ({
      id: String(c.id),
      label: c.name,
    }));
    if (context.companyId == null) {
      return fromApi;
    }
    const currentIdStr = String(context.companyId);
    if (fromApi.some((opt) => opt.id === currentIdStr)) {
      return fromApi;
    }
    if (context.companyName?.trim()) {
      return [{ id: currentIdStr, label: context.companyName.trim() }, ...fromApi];
    }
    return fromApi;
  }, [companies, context.companyId, context.companyName]);

  // Dropdown options for Company level
  const branchOptions: DropdownOption<string>[] = useMemo(() => {
    const fromApi = branches.map((b) => ({
      id: String(b.id),
      label: b.name,
    }));
    if (context.branchId == null) {
      return fromApi;
    }
    const currentIdStr = String(context.branchId);
    if (fromApi.some((opt) => opt.id === currentIdStr)) {
      return fromApi;
    }
    if (context.branchName?.trim()) {
      return [{ id: currentIdStr, label: context.branchName.trim() }, ...fromApi];
    }
    return fromApi;
  }, [branches, context.branchId, context.branchName]);

  const outletOptions = level === 'organization' ? companyOptions : branchOptions;

  const selectedOutletSlug = useMemo(() => {
    if (level === 'branch') {
      return context.branchId != null ? String(context.branchId) : '';
    }
    // At Organization and Company levels, do not display any name by default so the context remains unambiguous
    return '';
  }, [level, context.branchId]);

  const resolvedOutletLabel = useMemo(() => {
    if (level === 'branch') {
      return branchDisplayName;
    }
    if (level === 'organization') {
      return 'Select Company';
    }
    return 'Select Branch';
  }, [level, branchDisplayName]);

  const placeholder = level === 'organization' ? 'Select Company' : 'Select Branch';

  const handleOutletChange = (id: string, option?: DropdownOption<string>) => {
    if (level === 'organization') {
      const numericId = Number(id);
      const company = companies.find((c) => String(c.id) === id);
      const name = company?.name ?? option?.label ?? '';
      const slug = company?.code?.trim() || name;
      const nextContext: SidebarContext = {
        ...context,
        organizationId: orgId,
        companyId: Number.isFinite(numericId) ? numericId : undefined,
        companyName: name,
        companySlug: slug,
        branchId: undefined,
        branchName: undefined,
        branchSlug: undefined,
      };
      setContext(nextContext);
      router.push(companyDashboardHref(nextContext, activeRole));
      return;
    }

    if (level === 'company') {
      const numericId = Number(id);
      const branch = branches.find((b) => String(b.id) === id);
      const name = branch?.name ?? option?.label ?? `Branch ${id}`;
      const slug = branch?.code?.trim() || String(id);
      const nextContext: SidebarContext = {
        ...context,
        branchId: Number.isFinite(numericId) ? numericId : undefined,
        branchName: name,
        branchSlug: slug,
      };
      setContext(nextContext);
      router.push(branchDashboardHref(branch ?? { id, name, code: slug }, nextContext, activeRole));
    }
  };

  const workspaceSubtitle =
    resolvedOutletLabel ||
    (context.branchId != null ? `Branch ${context.branchId}` : 'Restaurant workspace');

  const [mobileBranchMenuAnchor, setMobileBranchMenuAnchor] = useState<HTMLElement | null>(null);

  const displayName = activeUser?.name?.trim() || 'User';
  const displayRole = formatStaffProfileRoleLabel(activeUser?.role || activeRole);

  const navbarHeight = captainWorkspacePath
    ? { [screen.mobile]: 56, [screen.tablet]: 56, [screen.desktop]: 64 }
    : 64;

  return (
    <>
      <Box
        component="header"
        id="app-top-navbar"
        sx={[
          {
            position: 'fixed',
            top: 0,
            right: 0,
            left: {
              xs: 0,
              [screen.desktop]: isOpen ? 220 : 76,
            },
            width: {
              xs: '100%',
              [screen.desktop]: `calc(100% - ${isOpen ? 220 : 76}px)`,
            },
            height: navbarHeight,
            minHeight: navbarHeight,
            maxHeight: navbarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: captainWorkspacePath
              ? {
                  [screen.mobile]: POS_CAPTAIN_COMPACT_PADDING,
                  [screen.tablet]: POS_CAPTAIN_COMPACT_PADDING,
                  [screen.desktop]: 3,
                }
              : { xs: 2, sm: 3 },
            backgroundColor: (theme) => theme.palette.background.paper,
            borderBottom: '1px solid',
            borderColor: (theme) => theme.palette.divider,
            boxSizing: 'border-box',
            zIndex: 1100,
            transition:
              'left 160ms ease, width 160ms ease, background-color 0.2s ease, border-color 0.2s ease',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <MobileNavbar
          branchMenuAnchor={mobileBranchMenuAnchor}
          onOpenBranchMenu={setMobileBranchMenuAnchor}
          onCloseBranchMenu={() => setMobileBranchMenuAnchor(null)}
          mobileScopeLabel="OUTLETS"
          mobileOutletLabel={resolvedOutletLabel}
          mobileBranchOptions={level === 'branch' ? [] : outletOptions}
          mobileSelectedOutletSlug={selectedOutletSlug}
          onMobileOutletChange={handleOutletChange}
          hideOutletSelector={false}
          onNotificationClick={onNotificationClick}
          onOpenMenu={onOpenMenu}
          captainWorkspaceTitle={captainWorkspacePath ? 'Hospixo Tables' : undefined}
          captainWorkspaceSubtitle={captainWorkspacePath ? workspaceSubtitle : undefined}
          showBranchSelector={captainWorkspacePath && isBranchView}
          showProfileMenu={showWaiterProfileNav}
          user={activeUser}
          displayName={displayName}
          displayRole={displayRole}
          isReadOnly={level === 'branch'}
        />

        <TabletNavbar
          branchMenuAnchor={mobileBranchMenuAnchor}
          onOpenBranchMenu={setMobileBranchMenuAnchor}
          onCloseBranchMenu={() => setMobileBranchMenuAnchor(null)}
          mobileScopeLabel="OUTLETS"
          mobileOutletLabel={resolvedOutletLabel}
          mobileBranchOptions={level === 'branch' ? [] : outletOptions}
          mobileSelectedOutletSlug={selectedOutletSlug}
          onMobileOutletChange={handleOutletChange}
          hideOutletSelector={false}
          onNotificationClick={onNotificationClick}
          onOpenMenu={onOpenMenu}
          showProfileMenu={showWaiterProfileNav}
          user={activeUser}
          displayName={displayName}
          displayRole={displayRole}
          isReadOnly={level === 'branch'}
        />

        <DesktopNavbar
          level={level}
          outletOptions={outletOptions}
          hideOutletSelector={false}
          selectedOutletSlug={selectedOutletSlug}
          onOutletChange={handleOutletChange}
          branchDisplayName={branchDisplayName}
          placeholder={placeholder}
          isBranchView={isBranchView}
          mode={mode}
          onToggleMode={toggleMode}
          onNotificationClick={onNotificationClick}
          user={activeUser}
          displayName={displayName}
          displayRole={displayRole}
        />
      </Box>

      {/* Persistent layout offset ensuring page content is never covered by the fixed navbar */}
      <Box
        aria-hidden="true"
        sx={{
          height: navbarHeight,
          minHeight: navbarHeight,
          maxHeight: navbarHeight,
          flexShrink: 0,
          width: '100%',
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      />
    </>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import type { SidebarContext, SidebarUserProfile } from '@/app/sidebar';
import { normalizeRoleKey } from '@/app/sidebar';
import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { useNavbarBranchOptions } from '@/lib/hooks/organization/branches/useNavbarBranchOptions';
import { formatStaffProfileRoleLabel } from '@/lib/helpers/employees/userRolesHelpers';
import { isCaptainWorkspacePath, POS_CAPTAIN_COMPACT_PADDING } from '@/lib/helpers/posCaptainFlow';
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
 * Dynamic orchestrator for mobile, tablet, and desktop navigation headers.
 * Layout and actions are delegated to specialized components in `./top-navbar/`.
 *
 * Viewport sections rendered:
 * - Mobile: MobileNavbar (`xs: 'flex', sm: 'none'`)
 * - Tablet: TabletNavbar (`xs: 'none', sm: 'flex', md: 'none'`)
 * - Desktop: DesktopNavbar (`xs: 'none', md: 'flex'`)
 */
export function TopNavbar({
  role: propRole,
  context: propContext,
  user: propUser,
  onNotificationClick,
  onOpenMenu,
  sx,
}: Readonly<TopNavbarProps>) {
  // Store subscriptions
  const storeRole = useSidebarStore((state) => state.role);
  const storeContext = useSidebarStore((state) => state.context);
  const setContext = useSidebarStore((state) => state.setContext);
  const storeUser = useSidebarStore((state) => state.user);
  const context = propContext ?? storeContext;

  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  const activeRole = propRole || storeRole;
  const activeUser = propUser || storeUser;
  const normalizedRole = normalizeRoleKey(activeRole);
  const pathname = usePathname() ?? '';
  const hideOutletSelector = pathname === '/branch-manager/dashboard';

  const isBranchView = pathname.includes('/branch-manager');
  const captainWorkspacePath = isCaptainWorkspacePath(pathname);
  const showWaiterProfileNav = normalizedRole === 'waiter' && captainWorkspacePath;

  const skipBranchDirectoryFetch = pathname.includes('/menu/menus');
  const { options: branchDirectoryOptions } = useNavbarBranchOptions({
    enabled: !skipBranchDirectoryFetch && !hideOutletSelector,
  });

  const outletOptions: DropdownOption<string>[] = useMemo(() => {
    if (branchDirectoryOptions.length > 0) {
      return branchDirectoryOptions;
    }
    if (context.branchId == null) {
      return [];
    }
    return [
      {
        id: String(context.branchId),
        label: context.branchName?.trim() || `Branch ${context.branchId}`,
      },
    ];
  }, [branchDirectoryOptions, context.branchId, context.branchName]);

  const selectedOutletSlug =
    context.branchId != null ? String(context.branchId) : (outletOptions[0]?.id ?? '');

  const resolvedOutletLabel = useMemo(() => {
    const found = outletOptions.find((o) => o.id === selectedOutletSlug);
    return (
      found?.label ??
      context.branchName?.trim() ??
      (context.branchId != null ? `Branch ${context.branchId}` : 'Select branch')
    );
  }, [outletOptions, selectedOutletSlug, context.branchName, context.branchId]);

  useEffect(() => {
    if (context.branchId == null || context.branchName?.trim()) return;
    const match = outletOptions.find((o) => o.id === String(context.branchId));
    if (match?.label) {
      setContext({ branchName: match.label });
    }
  }, [context.branchId, context.branchName, outletOptions, setContext]);

  const handleOutletChange = (branchId: string, option?: DropdownOption<string>) => {
    const parsed = Number(branchId);
    const label = option?.label ?? outletOptions.find((o) => o.id === branchId)?.label;
    if (Number.isFinite(parsed)) {
      setContext({ branchId: parsed, branchName: label });
    } else {
      setContext({ branchName: label });
    }
  };

  const workspaceSubtitle =
    resolvedOutletLabel ||
    (context.branchId != null ? `Branch ${context.branchId}` : 'Restaurant workspace');

  const mobileScopeLabel = useMemo(() => {
    if (context.branchName || context.branchId || isBranchView) return 'BRANCHES';
    if (context.companyName || context.companyId) return 'COMPANIES';
    if (context.organizationName || context.organizationId) return 'ORGANIZATIONS';
    return 'OUTLETS';
  }, [context, isBranchView]);

  const [mobileBranchMenuAnchor, setMobileBranchMenuAnchor] = useState<HTMLElement | null>(null);

  const displayName = activeUser?.name?.trim() || 'User';
  const displayRole = formatStaffProfileRoleLabel(activeUser?.role || activeRole);

  return (
    <Box
      component="header"
      id="app-top-navbar"
      sx={[
        {
          position: { [screen.mobile]: 'sticky', [screen.tablet]: 'static' },
          top: 0,
          height: captainWorkspacePath
            ? { [screen.mobile]: 56, [screen.tablet]: 56, [screen.desktop]: 64 }
            : 64,
          minHeight: captainWorkspacePath
            ? { [screen.mobile]: 56, [screen.tablet]: 56, [screen.desktop]: 64 }
            : 64,
          maxHeight: captainWorkspacePath
            ? { [screen.mobile]: 56, [screen.tablet]: 56, [screen.desktop]: 64 }
            : 64,
          width: '100%',
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
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <MobileNavbar
        branchMenuAnchor={mobileBranchMenuAnchor}
        onOpenBranchMenu={setMobileBranchMenuAnchor}
        onCloseBranchMenu={() => setMobileBranchMenuAnchor(null)}
        mobileScopeLabel={mobileScopeLabel}
        mobileOutletLabel={resolvedOutletLabel}
        mobileBranchOptions={outletOptions}
        mobileSelectedOutletSlug={selectedOutletSlug}
        onMobileOutletChange={handleOutletChange}
        hideOutletSelector={hideOutletSelector}
        onNotificationClick={onNotificationClick}
        onOpenMenu={onOpenMenu}
        captainWorkspaceTitle={captainWorkspacePath ? 'Hospixo Tables' : undefined}
        captainWorkspaceSubtitle={captainWorkspacePath ? workspaceSubtitle : undefined}
        showBranchSelector={captainWorkspacePath && isBranchView}
        showProfileMenu={showWaiterProfileNav}
        user={activeUser}
        displayName={displayName}
        displayRole={displayRole}
      />

      <TabletNavbar
        branchMenuAnchor={mobileBranchMenuAnchor}
        onOpenBranchMenu={setMobileBranchMenuAnchor}
        onCloseBranchMenu={() => setMobileBranchMenuAnchor(null)}
        mobileScopeLabel={mobileScopeLabel}
        mobileOutletLabel={resolvedOutletLabel}
        mobileBranchOptions={outletOptions}
        mobileSelectedOutletSlug={selectedOutletSlug}
        onMobileOutletChange={handleOutletChange}
        hideOutletSelector={hideOutletSelector}
        onNotificationClick={onNotificationClick}
        onOpenMenu={onOpenMenu}
        showProfileMenu={showWaiterProfileNav}
        user={activeUser}
        displayName={displayName}
        displayRole={displayRole}
      />

      <DesktopNavbar
        outletOptions={outletOptions}
        hideOutletSelector={hideOutletSelector}
        selectedOutletSlug={selectedOutletSlug}
        onOutletChange={handleOutletChange}
        isBranchView={isBranchView}
        mode={mode}
        onToggleMode={toggleMode}
        onNotificationClick={onNotificationClick}
        user={activeUser}
        displayName={displayName}
        displayRole={displayRole}
      />
    </Box>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import type { SidebarContext, SidebarUserProfile } from '@/app/sidebar';
import { normalizeRoleKey } from '@/app/sidebar';
import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { MOCK_BRANCHES } from '@/lib/mocks/organization/branches.mocks';
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
  /** Triggered when the AI Agent button is clicked */
  onAiAgentClick?: () => void;
  /** Triggered when the Explore Products button is clicked */
  onExploreProductsClick?: () => void;
  /** Triggered when the Notification icon is clicked */
  onNotificationClick?: () => void;
  /** Triggered when the Settings icon is clicked */
  onSettingsClick?: () => void;
  /** Triggered when the mobile/tablet navigation menu button is clicked */
  onOpenMenu?: () => void;
  /** Optional layout style overrides from the caller */
  sx?: SxProps<Theme>;
}

/**
 * Normalizes and formats a role string for readable header display.
 */
function formatRoleLabel(role?: string): string {
  const value = (role ?? '').trim();
  if (!value) return 'User';
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
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
  onAiAgentClick,
  onExploreProductsClick,
  onNotificationClick,
  onSettingsClick,
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

  // Business rule: show AI Agent and Explore Products for managers/company, hide for waiter
  const showManagementActions = Boolean(normalizedRole) && normalizedRole !== 'waiter';

  // Desktop Outlets: preserved exactly as original
  const outletOptions: DropdownOption<string>[] =
    context.branchId == null
      ? []
      : [
          {
            id: String(context.branchId),
            label: context.branchName ?? `Branch ${context.branchId}`,
          },
        ];

  const selectedOutletSlug = context.branchId == null ? '' : String(context.branchId);

  const handleOutletChange = (branchId: string) => {
    const parsed = Number(branchId);
    if (!Number.isFinite(parsed)) return;
    setContext({ branchId: parsed });
  };

  const pathname = usePathname() ?? '';
  const isBranchView = pathname.includes('/branch-manager');
  const captainWorkspacePath = isCaptainWorkspacePath(pathname);
  const workspaceSubtitle =
    context.branchName?.trim() ||
    (context.branchId != null ? `Branch ${context.branchId}` : 'Restaurant workspace');

  // Mobile/Tablet dynamic branch options and labels
  const mobileBranchOptions: DropdownOption<string>[] = useMemo(() => {
    const baseList: DropdownOption<string>[] = MOCK_BRANCHES.map((b) => ({
      id: String(b.id),
      label: b.name,
    }));
    if (context.branchId != null) {
      const idStr = String(context.branchId);
      if (!baseList.some((o) => o.id === idStr)) {
        return [
          {
            id: idStr,
            label: context.branchName ?? `Branch ${context.branchId}`,
          },
          ...baseList,
        ];
      }
    }
    return baseList;
  }, [context.branchId, context.branchName]);

  const mobileSelectedOutletSlug =
    context.branchId != null ? String(context.branchId) : (mobileBranchOptions[0]?.id ?? '');

  const mobileOutletLabel = useMemo(() => {
    const found = mobileBranchOptions.find((o) => o.id === mobileSelectedOutletSlug);
    return found?.label ?? context.branchName ?? 'Downtown Central';
  }, [mobileBranchOptions, mobileSelectedOutletSlug, context.branchName]);

  const handleMobileOutletChange = (branchId: string, option?: DropdownOption<string>) => {
    const parsed = Number(branchId);
    const label = option?.label ?? mobileBranchOptions.find((o) => o.id === branchId)?.label;
    if (Number.isFinite(parsed)) {
      setContext({ branchId: parsed, branchName: label });
    } else {
      setContext({ branchName: label });
    }
  };

  const mobileScopeLabel = useMemo(() => {
    if (context.branchName || context.branchId || isBranchView) return 'BRANCHES';
    if (context.companyName || context.companyId) return 'COMPANIES';
    if (context.organizationName || context.organizationId) return 'ORGANIZATIONS';
    return 'OUTLETS';
  }, [context, isBranchView]);

  const [mobileBranchMenuAnchor, setMobileBranchMenuAnchor] = useState<HTMLElement | null>(null);

  const displayName = activeUser?.name?.trim() || 'User';
  const displayRole = formatRoleLabel(activeUser?.role || activeRole);

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
        mobileOutletLabel={mobileOutletLabel}
        mobileBranchOptions={mobileBranchOptions}
        mobileSelectedOutletSlug={mobileSelectedOutletSlug}
        onMobileOutletChange={handleMobileOutletChange}
        onNotificationClick={onNotificationClick}
        onOpenMenu={onOpenMenu}
        captainWorkspaceTitle={captainWorkspacePath ? 'Hospixo Tables' : undefined}
        captainWorkspaceSubtitle={captainWorkspacePath ? workspaceSubtitle : undefined}
      />

      <TabletNavbar
        branchMenuAnchor={mobileBranchMenuAnchor}
        onOpenBranchMenu={setMobileBranchMenuAnchor}
        onCloseBranchMenu={() => setMobileBranchMenuAnchor(null)}
        mobileScopeLabel={mobileScopeLabel}
        mobileOutletLabel={mobileOutletLabel}
        mobileBranchOptions={mobileBranchOptions}
        mobileSelectedOutletSlug={mobileSelectedOutletSlug}
        onMobileOutletChange={handleMobileOutletChange}
        showManagementActions={showManagementActions}
        onAiAgentClick={onAiAgentClick}
        onNotificationClick={onNotificationClick}
        onSettingsClick={onSettingsClick}
        onOpenMenu={onOpenMenu}
      />

      <DesktopNavbar
        outletOptions={outletOptions}
        selectedOutletSlug={selectedOutletSlug}
        onOutletChange={handleOutletChange}
        showManagementActions={showManagementActions}
        isBranchView={isBranchView}
        mode={mode}
        onToggleMode={toggleMode}
        onAiAgentClick={onAiAgentClick}
        onExploreProductsClick={onExploreProductsClick}
        onNotificationClick={onNotificationClick}
        onSettingsClick={onSettingsClick}
        user={activeUser}
        displayName={displayName}
        displayRole={displayRole}
      />
    </Box>
  );
}

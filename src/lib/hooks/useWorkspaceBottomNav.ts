'use client';

import { useMemo } from 'react';
import { useGrowthBook } from '@growthbook/growthbook-react';

import {
  filterSidebarByFeatureFlags,
  hasPermission,
  DEFAULT_ROLE_PERMISSIONS,
  normalizeRoleKey,
  type WaiterWorkspaceNavItem,
} from '@/app/sidebar';
import { isFeatureFlagDefaultOn } from '@/integrations/growthbook/featureFlags';
import {
  activeWorkspaceNavId,
  workspaceBottomNavItemsForRole,
} from '@/lib/helpers/waiterWorkspaceNav';
import { useSidebarStore } from '@/stores/sidebarStore';

function navItemToSidebarShape(item: WaiterWorkspaceNavItem) {
  return {
    name: item.name,
    href: item.captainFlowSuffix,
    permission: item.permission,
    featureFlag: item.featureFlag,
  };
}

/** Captain shell bottom tabs filtered by role, permissions, and feature flags. */
export function useWorkspaceBottomNav(pathname: string) {
  const role = useSidebarStore((state) => state.role);
  const gb = useGrowthBook();

  const items = useMemo(() => workspaceBottomNavItemsForRole(role), [role]);

  const visibleItems = useMemo(() => {
    const normalized = normalizeRoleKey(role ?? '');
    const permissions = DEFAULT_ROLE_PERMISSIONS[normalized] ?? [];

    const flagged = filterSidebarByFeatureFlags(
      items.map(navItemToSidebarShape),
      (flag) => gb?.isOn(flag) ?? isFeatureFlagDefaultOn(flag),
    );

    const allowedHrefs = new Set(
      flagged.map((entry) => ('href' in entry ? entry.href : undefined)).filter(Boolean),
    );

    return items.filter(
      (item) =>
        allowedHrefs.has(item.captainFlowSuffix) && hasPermission(permissions, item.permission),
    );
  }, [gb, items, role]);

  const activeId = useMemo(
    () => activeWorkspaceNavId(pathname, visibleItems.length > 0 ? visibleItems : items),
    [items, pathname, visibleItems],
  );

  return { items: visibleItems.length > 0 ? visibleItems : items, activeId };
}

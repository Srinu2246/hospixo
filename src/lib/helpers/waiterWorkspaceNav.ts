import { CAPTAIN_WORKSPACE_NAV, type WaiterWorkspaceNavItem } from '@/app/sidebar';

/** Footer + sidebar tabs for captain-flow (same catalog for waiter and branch manager). */
export function workspaceBottomNavItemsForRole(
  _role?: string | null,
): readonly WaiterWorkspaceNavItem[] {
  return CAPTAIN_WORKSPACE_NAV;
}

export function activeWorkspaceNavId(
  pathname: string,
  items: readonly WaiterWorkspaceNavItem[],
): WaiterWorkspaceNavItem['id'] {
  const match = items.find((item) => item.isActivePath(pathname));
  return match?.id ?? items[0]?.id ?? 'tables';
}

/** First captain-flow screen after login for waiter (Tables). */
export function waiterWorkspaceHomePath(roleSegment: string): string {
  const suffix = CAPTAIN_WORKSPACE_NAV[0]?.captainFlowSuffix ?? '/pos/captain-flow/tables';
  return `/${roleSegment}${suffix}`;
}

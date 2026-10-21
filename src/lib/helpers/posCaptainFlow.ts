/** Horizontal padding for captain-flow on mobile and tablet (Figma). */
export const POS_CAPTAIN_COMPACT_PADDING = '15px';

/** Space reserved for fixed bottom tab bar in captain-flow compact layout. */
export const POS_CAPTAIN_BOTTOM_NAV_HEIGHT = 64;

/** Sticky action row portaled to `#app-shell-footer` (Figma). */
export const POS_CAPTAIN_STICKY_FOOTER_HEIGHT = 72;

/** Gap between scrollable list content and captain bottom nav (ready-list, all-orders). */
export const POS_CAPTAIN_LIST_BOTTOM_GAP = 20;

const MOBILE_CAPTAIN_POS_SCREEN =
  /\/pos\/(?:captain-flow|point-of-sale\/(?:tables|dine-in|order-menu|ready-list|all-orders|takeaway))(?:\/|$)/;

export function isCaptainFlowPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname.includes('captain-flow');
}

/** Captain list index screens (ready-list, all-orders index) — gap above bottom nav. */
export function isCaptainListScreenPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname.includes('/ready-list')) return true;
  if (pathname.includes('/all-orders/')) return false;
  return pathname.includes('/all-orders');
}

/** Captain order settle route (`.../all-orders/:orderId`). */
export function isCaptainOrderSettlePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return /\/all-orders\/[^/?#]+/.test(pathname);
}

export function captainMainUsesStickyFooter(pathname: string | null | undefined): boolean {
  if (!isCaptainWorkspacePath(pathname)) return false;
  if (isCaptainListScreenPath(pathname)) return false;
  if (isCaptainOrderSettlePath(pathname)) return true;
  return true;
}

/** Captain / waiter mobile shell: captain-flow or matching POS screens (mobile/tablet only). */
export function isCaptainWorkspacePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (isCaptainFlowPath(pathname)) return true;
  return MOBILE_CAPTAIN_POS_SCREEN.test(pathname);
}

/** e.g. `/branch/pos/captain-flow` from any captain sub-route. */
export function resolveCaptainFlowBase(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '');
  const captainMarker = '/captain-flow';
  const captainIndex = normalized.indexOf(captainMarker);
  if (captainIndex !== -1) {
    return normalized.slice(0, captainIndex + captainMarker.length);
  }

  const posMarker = '/pos/point-of-sale';
  const posIndex = normalized.indexOf(posMarker);
  if (posIndex !== -1) {
    return `${normalized.slice(0, posIndex)}/pos/captain-flow`;
  }

  return '/pos/captain-flow';
}

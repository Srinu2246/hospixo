import { breakpoints } from '@/lib/theme/mui/breakpoints';

/** Viewports below `lg` use workspace mobile topbar + bottom nav (matches floor compact layout). */
export const workspaceMobileChromeMaxWidthPx = breakpoints.lg - 1;

export const workspaceMobileChromeCopy = {
  companiesEyebrow: 'Companies',
  allCompaniesLabel: 'All Companies',
  selectCompanyPlaceholder: 'Select company',
  notificationsLabel: 'Notifications',
  notificationsTitle: 'Notifications coming soon',
  exploreProductsLabel: 'Explore products',
  homeAriaLabel: 'Hospixo home',
  bottomNavAriaLabel: 'Workspace mobile navigation',
} as const;

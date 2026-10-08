import { routes } from '@/config/routes';

export type PosDashboardMobileNavId = 'dashboard' | 'staff' | 'finance' | 'reports' | 'profile';

export interface PosDashboardMobileNavItem {
  id: PosDashboardMobileNavId;
  href: string;
  label: string;
  icon: 'dashboard' | 'staff' | 'financials' | 'reports' | 'profile';
}

/** Manager bottom nav for POS dashboard on mobile/tablet. */
export const posDashboardMobileBottomNav: PosDashboardMobileNavItem[] = [
  {
    id: 'dashboard',
    href: routes.platform.pos.dashboard,
    label: 'Dashboard',
    icon: 'dashboard',
  },
  {
    id: 'staff',
    href: routes.dashboard.hr,
    label: 'Staff',
    icon: 'staff',
  },
  {
    id: 'finance',
    href: routes.dashboard.finance,
    label: 'Finance',
    icon: 'financials',
  },
  {
    id: 'reports',
    href: routes.dashboard.reports,
    label: 'Reports',
    icon: 'reports',
  },
  {
    id: 'profile',
    href: routes.dashboard.profile,
    label: 'Profile',
    icon: 'profile',
  },
];

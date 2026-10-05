import { routes } from '@/config/routes';

export const usersRolesNavItems = [
  { href: routes.dashboard.root, label: 'Dashboard', icon: 'dashboard' as const },
  {
    href: routes.platform.employees.company,
    label: 'Users & Roles',
    icon: 'users' as const,
  },
  { href: routes.platform.branches, label: 'Branches', icon: 'branches' as const },
  { href: routes.platform.inventory, label: 'Inventory', icon: 'inventory' as const },
  { href: routes.platform.reports, label: 'Reports', icon: 'reports' as const },
  { href: routes.platform.settings, label: 'Settings', icon: 'settings' as const },
];

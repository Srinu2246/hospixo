import type { MenuCreationScope, MenuPageConfig } from '@/lib/schemas/menu/menuCreationSchema';

const SCOPE_CONFIG: Record<MenuCreationScope, MenuPageConfig> = {
  company: {
    scope: 'company',
    canManageCategories: true,
    homeHref: '/company/dashboard',
    pageTitle: 'Menu Management',
    pageSubtitle: 'Manage all items across your menu categories.',
  },
  branch: {
    scope: 'branch',
    canManageCategories: true,
    homeHref: '/branch-manager/dashboard',
    pageTitle: 'Menu Management',
    pageSubtitle: 'Manage all items across your menu categories.',
  },
  organization: {
    scope: 'organization',
    canManageCategories: true,
    homeHref: '/organization/dashboard',
    pageTitle: 'Menu Management',
    pageSubtitle: 'Manage all items across your menu categories.',
  },
};

export function getMenuPageConfig(scope: MenuCreationScope): MenuPageConfig {
  return SCOPE_CONFIG[scope];
}

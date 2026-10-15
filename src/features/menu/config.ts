import type {
  MenuAvailabilityPageConfig,
  MenuAvailabilityScope,
} from '@/lib/schemas/menu/menuAvailabilitySchema';
import type { MenuCreationScope, MenuPageConfig } from '@/lib/schemas/menu/menuCreationSchema';

/** Shared sidebar scope for all menu feature screens. */
export type MenuScope = MenuCreationScope | MenuAvailabilityScope;

const HOME_HREF: Record<MenuScope, string> = {
  company: '/company/dashboard',
  branch: '/branch-manager/dashboard',
  organization: '/organization/dashboard',
};

const MENU_CREATION_CONFIG: Record<
  MenuCreationScope,
  Omit<MenuPageConfig, 'scope' | 'homeHref'>
> = {
  company: {
    canManageCategories: true,
    pageTitle: 'Menu Management',
    pageSubtitle: 'Manage all items across your menu categories.',
  },
  branch: {
    canManageCategories: true,
    pageTitle: 'Menu Management',
    pageSubtitle: 'Manage all items across your menu categories.',
  },
  organization: {
    canManageCategories: true,
    pageTitle: 'Menu Management',
    pageSubtitle: 'Manage all items across your menu categories.',
  },
};

const MENU_AVAILABILITY_CONFIG: Record<
  MenuAvailabilityScope,
  Omit<MenuAvailabilityPageConfig, 'scope' | 'homeHref'>
> = {
  company: {
    pageTitle: 'Menu Availability',
    pageSubtitle: 'Manage item availability across all channels',
    syncLabel: 'Synced with Swiggy · Zomato',
  },
  branch: {
    pageTitle: 'Menu Availability',
    pageSubtitle: 'Manage item availability across all channels',
    syncLabel: 'Synced with Swiggy · Zomato',
  },
  organization: {
    pageTitle: 'Menu Availability',
    pageSubtitle: 'Manage item availability across all channels',
    syncLabel: 'Synced with Swiggy · Zomato',
  },
};

/** Page config for Menu Creation (company / branch / organization). */
export function getMenuCreationPageConfig(scope: MenuCreationScope): MenuPageConfig {
  return {
    scope,
    homeHref: HOME_HREF[scope],
    ...MENU_CREATION_CONFIG[scope],
  };
}

/** Page config for Menu Availability (company / branch / organization). */
export function getMenuAvailabilityPageConfig(
  scope: MenuAvailabilityScope,
): MenuAvailabilityPageConfig {
  return {
    scope,
    homeHref: HOME_HREF[scope],
    ...MENU_AVAILABILITY_CONFIG[scope],
  };
}

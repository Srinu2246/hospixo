import { routes } from '@/config/routes';
import type { MenuScope } from '../lib/menu-store';

export type MenuPageConfig = Readonly<{
  scope: MenuScope;
  canManageCategories: boolean;
  homeHref: string;
  pageTitle: string;
  pageSubtitle: string;
}>;

export const companyMenuPageConfig: MenuPageConfig = {
  scope: 'company',
  canManageCategories: true,
  homeHref: routes.dashboard.company,
  pageTitle: 'Menu Creation',
  pageSubtitle:
    'Create company-wide or outlet-specific items. Assign menus per outlet in Menu Management.',
};

export const branchMenuPageConfig: MenuPageConfig = {
  scope: 'branch',
  canManageCategories: true,
  homeHref: routes.dashboard.branch,
  pageTitle: 'Branch Menu',
  pageSubtitle: 'Manage categories and items for this branch. Availability is managed separately.',
};

import { routes } from '@/config/routes';

export type MenuBuilderPageConfig = {
  homeHref: string;
  pageTitle: string;
  pageSubtitle: string;
};

export const companyMenuBuilderPageConfig: MenuBuilderPageConfig = {
  homeHref: routes.dashboard.company,
  pageTitle: 'Menu Builder',
  pageSubtitle: 'Create and manage restaurant menus, category assignments, and menu trees.',
};

export const branchMenuBuilderPageConfig: MenuBuilderPageConfig = {
  homeHref: routes.dashboard.branch,
  pageTitle: 'Menu Builder',
  pageSubtitle:
    'Build dine-in menus for this outlet. Company catalog items and settings are inherited automatically.',
};

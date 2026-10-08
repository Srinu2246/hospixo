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

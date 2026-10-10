import { routes } from '@/config/routes';
import { flowPaths } from '@/config/shell/flow-paths';

export type MenusFlowScope = 'company' | 'branch';

export type MenusRoutes = Readonly<{
  scope: MenusFlowScope;
  root: string;
  create: string;
  detail: (sessionId: string) => string;
  edit: (sessionId: string) => string;
  homeHref: string;
}>;

export function getMenusRoutes(scope: MenusFlowScope): MenusRoutes {
  const root = scope === 'branch' ? flowPaths.branch.menus : flowPaths.company.menus;
  const homeHref = scope === 'branch' ? routes.dashboard.branch : routes.dashboard.company;
  return {
    scope,
    root,
    create: `${root}/create`,
    detail: (sessionId: string) => `${root}/${encodeURIComponent(sessionId)}`,
    edit: (sessionId: string) => `${root}/${encodeURIComponent(sessionId)}/edit`,
    homeHref,
  };
}

/** Default company menus routes (legacy import sites). */
export const menusRoutes = getMenusRoutes('company');

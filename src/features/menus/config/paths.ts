import { flowPaths } from '@/config/shell/flow-paths';

const root = flowPaths.company.menus;

export const menusRoutes = {
  root,
  create: `${root}/create`,
  detail: (sessionId: string) => `${root}/${encodeURIComponent(sessionId)}`,
  edit: (sessionId: string) => `${root}/${encodeURIComponent(sessionId)}/edit`,
} as const;

import { routes } from '@/config/routes';

function pathMatches(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Company + branch workspace dashboards use the full Figma header chrome. */
export function showsWorkspaceHeaderActions(pathname: string): boolean {
  return (
    pathMatches(pathname, routes.dashboard.company) ||
    pathMatches(pathname, routes.dashboard.branch)
  );
}

/** Workspace header chrome — desktop, laptop, tablet, and mobile topbars. */
export const headerChrome = {
  showThemeToggle: true,
  showNotifications: true,
  showAiAgent: true,
  showExploreProducts: true,
  showSettings: true,
} as const;

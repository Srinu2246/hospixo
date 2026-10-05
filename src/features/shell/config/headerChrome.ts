/** Workspace header chrome — mirrors platform `header-chrome.ts`. */
export const headerChrome = {
  showThemeToggle: false,
  showNotifications: true,
  showAiAgent: true,
  showExploreProducts: true,
  showSettings: true,
} as const;

export function showsWorkspaceHeaderActions(pathname: string): boolean {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

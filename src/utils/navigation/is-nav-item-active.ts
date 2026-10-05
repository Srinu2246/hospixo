import { ADMIN_ROUTES } from '@/constants/routes';

export function isNavItemActive(pathname: string, href: string, itemId: string): boolean {
  if (pathname.startsWith('/onboarding/create/')) {
    return itemId === 'organization-setup';
  }

  if (itemId === 'organization-setup') {
    if (pathname === href || pathname.startsWith(`${href}/`)) return true;
    if (pathname.startsWith(`${ADMIN_ROUTES.companies}/`)) return true;
    return false;
  }

  if (itemId === 'onboarding') {
    if (pathname.startsWith('/onboarding/create/')) return false;
    return (
      pathname === ADMIN_ROUTES.onboarding || pathname.startsWith(`${ADMIN_ROUTES.onboarding}/`)
    );
  }

  if (itemId === 'leads') {
    return pathname === ADMIN_ROUTES.onboarding;
  }

  if (pathname === href) return true;
  if (href !== ADMIN_ROUTES.dashboard && pathname.startsWith(`${href}/`)) return true;

  return false;
}

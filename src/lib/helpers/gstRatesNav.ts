/** Dashboard home for GST Rates breadcrumbs (company / branch / organization scope). */
export function getGstRatesDashboardHref(pathname: string): string {
  if (pathname.startsWith('/branch-manager')) {
    return '/branch-manager/dashboard';
  }
  if (pathname.startsWith('/organization')) {
    return '/organization/dashboard';
  }
  return '/company/dashboard';
}

export const GST_RATES_BREADCRUMB_LINK_SX = {
  color: 'text.primary',
  fontWeight: 500,
  '&:hover': {
    color: 'primary.main',
    textDecoration: 'underline',
  },
} as const;

export const GST_RATES_BREADCRUMB_ACTIVE_SX = {
  color: 'primary.main',
  fontWeight: 600,
} as const;

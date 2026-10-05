export const AUTH_ROUTES = {
  login: '/login',
  sso: '/sso',
  mfa: '/mfa',
} as const;

export const ADMIN_ROUTES = {
  dashboard: '/dashboard',
  organizations: '/organizations',
  organizationsCreate: '/organizations/create',
  organizationsCreateDetails: '/organizations/create/details',
  organizationsCreateCommercial: '/organizations/create/commercial',
  organizationsCreateReview: '/organizations/create/review',
  organizationsCreateComplete: '/organizations/create/complete',
  organizationsCreateDrafts: '/organizations/create/drafts',
  organizationCreateDraftPath: (organizationId: string) =>
    `/organizations/create/draft/${encodeURIComponent(organizationId)}`,
  companies: '/companies',
  subscriptions: '/subscriptions',
  subscriptionsCreate: '/subscriptions/create',
  subscriptionsCreateFeatures: '/subscriptions/create/features',
  subscriptionsCreateReview: '/subscriptions/create/review',
  subscriptionsCreateComplete: '/subscriptions/create/complete',
  plans: '/plans',
  products: '/products',
  payments: '/payments',
  invoices: '/invoices',
  featureFlags: '/feature-flags',
  onboarding: '/onboarding',
  onboardingCreate: '/onboarding/create/company',
  onboardingCreateCompany: '/onboarding/create/company',
  onboardingCreateContact: '/onboarding/create/contact-location',
  onboardingCreateTax: '/onboarding/create/tax-compliance',
  onboardingCreateSubscription: '/onboarding/create/subscription',
  onboardingCreateReview: '/onboarding/create/review',
  onboardingCreateComplete: '/onboarding/create/complete',
  operations: '/operations',
  tenantActivation: '/operations/tenant-activation',
  dataImports: '/operations/data-imports',
  failedJobs: '/operations/failed-jobs',
  integrationHealth: '/operations/integration-health',
  support: '/support',
  tickets: '/support/tickets',
  customerSearch: '/support/customer-search',
  impersonationRequests: '/support/impersonation-requests',
  finance: '/finance',
  audit: '/audit',
  security: '/security',
  systemHealth: '/system-health',
  releaseManagement: '/release-management',
  settings: '/settings',
} as const;

export const routes = {
  auth: AUTH_ROUTES,
  admin: ADMIN_ROUTES,
} as const;

export const ADMIN_PROTECTED_PREFIXES = Object.values(ADMIN_ROUTES);

export function isAdminProtectedPath(pathname: string): boolean {
  return ADMIN_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

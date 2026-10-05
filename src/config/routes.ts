export const routes = {
  marketing: {
    home: '/',
    restaurants: '/restaurants',
    industries: '/industries',
    features: '/features',
    services: '/services',
    dataMigration: '/data-migration',
    implementation: '/implementation',
    productTraining: '/product-training',
    customWorkflow: '/custom-workflow',
    integrationSupport: '/integration-support',
    dedicatedSupport: '/dedicated-support',
    auditQc: '/audit-qc',
    productUpdates: '/product-updates',
    platform: '/platform',
    ourFeatures: '/our-features',
    pricing: '/pricing',
    about: '/about',
    careers: '/careers',
    contact: '/contact',
    privacy: '/privacy',
    privacySecurity: '/privacy-security',
    terms: '/terms',
    bookDemo: '/book-demo',
    aiSuite: '/ai-suite',
    blogResources: '/blog-resources',
    faq: '/faq',
    helpCenter: '/help-center',
    solutions: '/solutions',
    integrations: '/integrations',
    aiInsights: '/ai-insights',
  },
  products: {
    pos: '/pos',
    billing: '/billing',
    kitchen: '/kitchen',
    finance: '/finance',
    procurement: '/procurement',
    hrManagement: '/hr-management',
    hotelManagement: '/hotel-management',
    club: '/club',
    bar: '/bar',
    inventory: '/inventory',
    vendorManagement: '/vendor-management',
  },
  /**
   * Tenant dashboard app routes (`apps/platform`).
   * Auth-gated prefixes are derived from this object — add new module
   * paths here so `tenantProtectedPrefixes` / proxy stay in sync.
   */
  dashboard: {
    root: '/dashboard',
    company: '/company',
    organisation: '/organisation',
    branch: '/branch',
    /** Captain floor flow — fixed captain AccessSidebar. */
    captain: '/captain',
    /** Cashier / counter flow — fixed cashier AccessSidebar. */
    cashier: '/cashier',
    operations: '/operations',
    pos: '/pos',
    inventory: '/inventory',
    finance: '/finance',
    hr: '/hr',
    kitchen: '/kitchen',
    chef: '/chef',
    hotel: '/hotel',
    rooms: '/hotel/rooms',
    reservations: '/hotel/reservations',
    housekeeping: '/hotel/housekeeping',
    club: '/club',
    events: '/club/events',
    memberships: '/club/memberships',
    procurement: '/procurement',
    vendorManagement: '/vendor-management',
    reports: '/reports',
    analytics: '/analytics',
    floors: '/branch/floor-table-setup',
    floorCreate: '/branch/floor-table-setup/create',
    settings: '/settings',
    profile: '/profile',
    audit: '/audit',
  },
  settings: {
    root: '/settings',
    branches: '/settings/branches',
    branchesAdd: '/settings/branches/add',
    branchesAddBranchData: '/settings/branches/add/branch-data',
    branchesAddDepartments: '/settings/branches/add/departments',
    branchesAddStaff: '/settings/branches/add/staff-assignment',
    branchesAddFinalize: '/settings/branches/add/finalize',
    branchesAddComplete: '/settings/branches/add/complete',
    staffAdd: '/settings/staff/add',
  },
  auth: {
    login: '/login',
    register: '/register',
    pinLogin: '/pin-login',
    platformLogin: '/platform-login',
    otpLogin: '/otp-login',
    otpVerify: '/otp-login/verify',
    forgotPassword: '/forgot-password',
    forgotPasswordSent: '/forgot-password/sent',
    resetPassword: '/reset-password',
    changePassword: '/change-password',
    /** Public hop after login so the new session cookie is sent on the next document request. */
    sessionContinue: '/signed-in',
    inviteAccept: '/invite/accept',
    inviteReject: '/invite/reject',
  },
  platform: {
    /**
     * People + roles live under org / company / branch — not under Settings.
     * Invite / create-role wizards use shared `/employees/*` and `/roles/*` paths
     * (outside Settings) so one wizard tree works for every hierarchy level.
     */
    employees: {
      organisation: '/organisation/employees',
      company: '/company/employees',
      branch: '/branch/staff',
    },
    usersRoles: {
      /** @deprecated Prefer `routes.platform.employees.*` by access level. */
      root: '/company/employees',
      addUser: {
        root: '/employees/add-user',
        customTemplate: '/employees/add-user/custom-template',
        details: '/employees/add-user/details',
        permissions: '/employees/add-user/permissions',
        review: '/employees/add-user/review',
        invitationSuccess: '/employees/add-user/invitation-success',
      },
      createRole: {
        root: '/roles/create',
        permissions: '/roles/create/permissions',
        review: '/roles/create/review',
        customTemplate: '/roles/create/custom-template',
      },
      editStaffPrefix: '/employees/edit-staff',
      viewStaffPrefix: '/employees/view-staff',
      createUser: '/employees/create-user',
      invitationSuccess: '/employees/invitation-success',
      invitations: '/employees/invitations',
      roles: {
        /** @deprecated Prefer employees paths — Users & Roles is one page. */
        organisation: '/organisation/employees',
        company: '/company/employees',
        branch: '/branch/staff',
      },
      editRolePrefix: '/users-roles/edit-role',
    },
    branches: '/settings/branches',
    inventory: '/inventory',
    reports: '/reports',
    settings: '/settings',
    /** Flat POS + day-close screen URLs — no /pos prefix. */
    pos: {
      root: '/tables',
      dashboard: '/pos-dashboard',
      tables: '/tables',
      dineIn: '/dine-in',
      checkoutPayment: '/checkout-payment',
      orderReview: '/order-review',
      paymentSuccess: '/payment-success',
      onlineOrders: '/online-orders',
      openOrders: '/open-orders',
      readyList: '/readylist',
      duePayments: '/duepayments',
      cashShift: '/cash-shift',
      dayClose: '/day-close',
      cashReconciliation: '/day-close/cash-reconciliation',
      dailySalesSummary: '/day-close/cash-reconciliation/sales',
      dayCloseClosing: '/day-close/closing',
      dayCloseSuccess: '/day-close/success',
    },
  },
  /**
   * Internal control plane (`apps/admin` on admin.hospixo.com).
   * Auth-gated prefixes are derived from this object — add new module
   * paths here so `adminProtectedPrefixes` / proxy stay in sync.
   * Hospixo super-admin lives only here.
   */
  admin: {
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
  },
} as const;

/** All platform POS screen paths (flat URLs — no /pos prefix). */
export const platformPosRoutes = Object.values(routes.platform.pos);

/** True when pathname is a platform POS / day-close screen (custom shell, not app sidebar). */
export function isPlatformPosRoute(pathname: string): boolean {
  return platformPosRoutes.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Legacy /pos/* paths from earlier iterations — map to flat POS routes. */
export const legacyPosRedirects: Record<string, string> = {
  '/pos': routes.platform.pos.dashboard,
  '/pos/tables': routes.platform.pos.tables,
  '/pos/dine-in': routes.platform.pos.dineIn,
  '/pos/checkout-payment': routes.platform.pos.checkoutPayment,
  '/pos/order-review': routes.platform.pos.orderReview,
  '/pos/payment-success': routes.platform.pos.paymentSuccess,
  '/pos/online-orders': routes.platform.pos.onlineOrders,
  '/pos/open-orders': routes.platform.pos.openOrders,
  '/pos/readylist': routes.platform.pos.readyList,
  '/pos/duepayments': routes.platform.pos.duePayments,
  '/pos/cash-shift': routes.platform.pos.cashShift,
};

/** Path prefixes that require a session cookie in the tenant workspace app. */
export const tenantProtectedPrefixes = [
  ...new Set([
    ...Object.values(routes.dashboard),
    ...platformPosRoutes,
    routes.platform.employees.organisation,
    routes.platform.employees.company,
    routes.platform.employees.branch,
    routes.platform.usersRoles.addUser.root,
    routes.platform.usersRoles.createRole.root,
    '/employees',
    '/roles',
    routes.platform.branches,
    routes.platform.reports,
    routes.platform.inventory,
    routes.platform.settings,
  ]),
] as readonly string[];

export function isTenantProtectedPath(pathname: string): boolean {
  return tenantProtectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Path prefixes that require a session cookie in `apps/admin`. */
export const adminProtectedPrefixes = Object.values(
  routes.admin,
) as readonly (typeof routes.admin)[keyof typeof routes.admin][];

export function isAdminProtectedPath(pathname: string): boolean {
  return adminProtectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

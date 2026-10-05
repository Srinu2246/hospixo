/**
 * Tenant dashboard scopes in `apps/platform`.
 * Post-login home is chosen by `resolveDashboardHomePath` from the user token.
 */
export const platformDashboardScopes = {
  organisation: {
    key: 'organisation',
    label: 'Organisation dashboard',
    path: '/organisation',
    description:
      'Organisation owner home — companies, branches, employees, and full operational access.',
  },
  company: {
    key: 'company',
    label: 'Company dashboard',
    path: '/company',
    description:
      'Company home — all branches under the company, up to kitchen (not organisation settings).',
  },
  branch: {
    key: 'branch',
    label: 'Branch dashboard',
    path: '/branch',
    description: 'Branch manager home — orders, counter, kitchen, employees, and branch inventory.',
  },
} as const;

export type PlatformDashboardScope =
  (typeof platformDashboardScopes)[keyof typeof platformDashboardScopes]['key'];

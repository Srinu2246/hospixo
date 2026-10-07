import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

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

export const COMMON_DATE_RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'last-7-days', label: 'Last 7 days' },
  { id: 'last-30-days', label: 'Last 30 days' },
  { id: 'custom', label: 'Custom' },
] as const satisfies ReadonlyArray<{ id: OrganisationDateRangeId; label: string }>;

export const COMMON_QUICK_HELP_COPY = {
  title: 'Quick Help',
  onlineStatus: 'Online Now',
  offlineStatus: 'Offline',
  whatsappCta: 'Contact on WhatsApp',
} as const;

export const DEFAULT_LEAKAGE_METRICS = {
  kots: {
    items: [
      { label: 'Cancelled', value: 0 },
      { label: 'Modified', value: 0 },
      { label: 'Shifted', value: 0 },
      { label: 'Not used in bills', value: 0 },
    ],
  },
  bills: {
    items: [
      { label: 'Modified', value: 0 },
      { label: 'Re-printed', value: 0 },
      { label: 'Knocked off', value: '₹0', tone: 'neutral' as const },
    ],
  },
} as const;

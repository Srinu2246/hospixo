/**
 * Sidebar / nav targets that do not have a full feature implementation yet.
 * Each entry gets a workspace `page.tsx` that renders {@link UnderConstructionPage}.
 *
 * When a feature ships, remove its path here and replace the placeholder page.
 */
export type UnderConstructionRouteDef = Readonly<{
  title: string;
  /** Optional short context shown under the heading. */
  subtitle?: string;
}>;

export const underConstructionRoutes = {
  '/organisation/companies/new': {
    title: 'Add Company',
    subtitle: 'Create and onboard a new company under your organisation.',
  },
  '/organisation/companies/analytics': {
    title: 'Company Analytics',
    subtitle: 'Cross-company performance and trends.',
  },
  '/organisation/branch/new': {
    title: 'Add Branch',
    subtitle: 'Register a new branch location.',
  },
  '/organisation/branches/performance': {
    title: 'Branch Performance',
    subtitle: 'Organisation-wide branch KPIs and comparisons.',
  },
  '/company/branches/analytics': {
    title: 'Branch Analytics',
    subtitle: 'Analytics for branches in this company.',
  },
  '/company/branches/performance': {
    title: 'Branch Performance',
    subtitle: 'Performance metrics for your company branches.',
  },
  '/company/customers': {
    title: 'Customers',
    subtitle: 'Company-wide customer profiles and history.',
  },
  '/pos/orders': {
    title: 'Orders',
    subtitle: 'Company-level order monitoring and search.',
  },
  '/hr/attendance': {
    title: 'Attendance',
    subtitle: 'Staff check-in, shifts, and attendance records.',
  },
  '/hr/schedule': {
    title: 'Schedule',
    subtitle: 'Staff rosters and shift planning.',
  },
  '/reports/sales': {
    title: 'Sales Reports',
    subtitle: 'Sales breakdowns by period, outlet, and channel.',
  },
  '/reports/revenue': {
    title: 'Revenue Reports',
    subtitle: 'Revenue recognition and collection summaries.',
  },
  '/reports/expenses': {
    title: 'Expense Reports',
    subtitle: 'Operating expenses and cost centre views.',
  },
  '/reports/taxes': {
    title: 'Tax Reports',
    subtitle: 'Tax summaries and filing support.',
  },
  '/settings/company': {
    title: 'Company Settings',
    subtitle: 'Company profile, defaults, and preferences.',
  },
  '/settings/branch': {
    title: 'Branch Settings',
    subtitle: 'Branch-specific configuration and preferences.',
  },
  '/kitchen/incoming': {
    title: 'Incoming Orders',
    subtitle: 'New tickets entering the kitchen queue.',
  },
  '/kitchen/preparing': {
    title: 'Preparing',
    subtitle: 'Orders currently in preparation.',
  },
  '/kitchen/ready': {
    title: 'Ready Orders',
    subtitle: 'Completed items waiting for pickup or service.',
  },
} as const satisfies Record<string, UnderConstructionRouteDef>;

export type UnderConstructionPath = keyof typeof underConstructionRoutes;

export function getUnderConstructionRoute(path: string): UnderConstructionRouteDef | undefined {
  const normalized = path.replace(/\/$/, '') || '/';
  return underConstructionRoutes[normalized as UnderConstructionPath];
}

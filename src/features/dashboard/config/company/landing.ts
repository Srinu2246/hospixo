import type { ElementType } from 'react';

import { companySidebar } from '@/config/shell/access-navigation';
import type { DashboardOverview } from '@/features/dashboard/types';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

export type CompanyNavItem = Readonly<{
  href: string;
  label: string;
  icon: ElementType;
}>;

export type CompanyNavGroup = Readonly<{
  label: string;
  items: CompanyNavItem[];
}>;

/** @deprecated Prefer `getAccessSidebar("company")` — kept for existing imports. */
export const companyNavigation: CompanyNavGroup[] = companySidebar.groups
  .filter((group): group is typeof group & { label: string } => Boolean(group.label))
  .map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.icon,
    })),
  }));

export const companyLandingContent = {
  header: {
    title: 'All Branches Statistics',
    dateRange: '28 Jun - 4 Jul 2026',
    exportButton: 'Export Data',
  },
  dateRangeOptions: [
    { id: 'today', label: 'Today' },
    { id: 'last-7-days', label: 'Last 7 days' },
    { id: 'last-30-days', label: 'Last 30 days' },
    { id: 'custom', label: 'Custom' },
  ] as const satisfies ReadonlyArray<{ id: OrganisationDateRangeId; label: string }>,
  fallback: {
    banner: 'Showing sample dashboard figures until live data is available.',
  },
  kpiSummary: {
    items: [
      { key: 'total', label: 'Total Sales', dataKey: 'totalSales', icon: 'lineChart' },
      { key: 'online', label: 'Online Sales', dataKey: 'onlineSales', icon: 'globe' },
      { key: 'offline', label: 'Offline Sales', dataKey: 'offlineSales', icon: 'banknote' },
      { key: 'branch', label: 'Branch', dataKey: 'branchStats', icon: 'barChart' },
    ],
    branchActiveLabel: 'Branches Active',
  },
  salesByOutlet: {
    sectionTitle: 'Sales by Branches',
    tabs: {
      chart: 'Total Sales',
      table: 'Top 10 Branches',
    },
    compareButton: 'Compare Branches',
    chartLimit: 10,
    tableColumns: [
      'BRANCH',
      'ORDERS',
      'SALES',
      'NET SALES',
      'TAX',
      'DISCOUNT',
      'MODIFIED',
      'RE-PRINTED',
      'WAIVED CHARGES',
    ],
  },
  operationsSummary: {
    sectionTitle: 'Operations Summary',
    taxTitle: 'Tax Summary',
    discountsTitle: 'Discounts Summary',
  },
  revenueForecast: {
    title: 'Revenue Forecast (AI-Powered)',
    subtitle: 'Predicted 7-Day Revenue',
  },
  customerInsights: {
    title: 'Customer Insights',
    newLabel: 'New',
    returnLabel: 'Return',
    averageOrderLabel: 'Average Order Value',
    heatmapTitle: 'Peak Hours Heatmap',
    dayLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    timeSlotLabels: ['Morning', 'Afternoon', 'Evening', 'Night'],
  },
  expenses: {
    title: "Today's Expenses",
    totalLabel: 'Total Expenses',
  },
  leakageTracker: {
    title: 'Leakage Tracker',
    groups: {
      kots: 'KOTs',
      bills: 'Bills',
    },
  },
  quickHelp: {
    title: 'Quick Help',
    onlineStatus: 'Online Now',
    offlineStatus: 'Offline',
    whatsappCta: 'Contact on WhatsApp',
  },
  error: {
    title: 'Unable to load dashboard',
    emptyMessage: 'No dashboard data returned.',
  },
  shell: {
    profileRole: 'Company manager',
    navAriaLabel: 'Company navigation',
    logoAriaLabel: 'Hospixo company home',
  },
} as const;

export const companyDashboardFallbackData: DashboardOverview = {
  outlets: [{ id: 'all', name: 'All Branches' }],
  kpis: {
    totalSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
    netSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
    onlineSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
    offlineSales: {
      amount: 0,
      currency: 'INR',
      changePercent: 0,
      changeLabel: 'vs yesterday',
    },
  },
  branchStats: {
    total: 0,
    active: 0,
  },
  salesByOutlet: [],
  taxSummary: {
    total: 0,
    items: [],
  },
  discountsSummary: {
    total: 0,
    items: [],
  },
  revenueForecast: {
    total: 0,
    confidence: 'No data',
    series: [0, 0, 0, 0, 0, 0, 0],
  },
  customerInsights: {
    newCustomerRate: 0,
    averageOrderValue: 0,
    aovChangePercent: 0,
    peakHours: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  expenses: {
    total: 0,
    items: [],
  },
  leakage: {
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
        { label: 'Knocked off', value: '₹0', tone: 'neutral' },
      ],
    },
  },
  accountManager: {
    name: 'Hospixo Support',
    phone: '+91 98765 43210',
    online: true,
    supportId: 'EMP-001',
    supportHours: '10:00 AM - 07:00 PM',
    supportMessage: 'Reach out for any billing, branch, or operational support queries.',
  },
};

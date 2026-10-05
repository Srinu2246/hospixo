import { routes } from '@/constants/routes';
import type { AdminDashboardOverview } from '@/types/dashboard';

export const dashboardPageCopy = {
  title: 'Dashboard',
  subtitle: 'Enterprise overview and real-time operations telemetry.',
  recentActivityTitle: 'Recent Activity',
  recentActivityLink: 'View audit logs',
  quickActionsTitle: 'Quick Actions',
} as const;

export const dashboardQuickActions: AdminDashboardOverview['quickActions'] = [
  {
    id: 'create-organization',
    title: 'Create Organization',
    description: 'Add a new restaurant entity',
    href: routes.admin.organizationsCreateDetails,
  },
  {
    id: 'view-organizations',
    title: 'View Organizations',
    description: 'Manage existing clients',
    href: routes.admin.organizations,
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    description: 'Billing tiers and gateways',
    href: routes.admin.subscriptions,
  },
  {
    id: 'support',
    title: 'Support Requests',
    description: 'Resolve outstanding issues',
    href: routes.admin.support,
  },
];

export const dashboardFallbackOverview: AdminDashboardOverview = {
  metrics: [
    {
      id: 'total-organizations',
      label: 'Total Organizations',
      value: 142,
      changePercent: 8.2,
      changeLabel: 'vs last month',
    },
    {
      id: 'active-organizations',
      label: 'Active Organizations',
      value: 98,
      changePercent: 5.4,
      changeLabel: 'vs last month',
    },
    {
      id: 'trial-organizations',
      label: 'Trial Organizations',
      value: 23,
      changePercent: -1.2,
      changeLabel: 'vs last month',
    },
    {
      id: 'total-companies',
      label: 'Total Companies',
      value: 456,
      changePercent: 12.4,
      changeLabel: 'vs last month',
    },
    {
      id: 'total-branches',
      label: 'Total Branches',
      value: 1204,
      changePercent: 4.8,
      changeLabel: 'vs last month',
    },
    {
      id: 'total-users',
      label: 'Total Users',
      value: 8432,
      changePercent: 16.3,
      changeLabel: 'vs last month',
    },
  ],
  recentActivity: [
    {
      id: '1',
      companyName: 'Al Baik Foods',
      description: 'New Company Created',
      status: 'created',
      occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      companyName: "Mama's Kitchen",
      description: 'Subscription Expiring',
      status: 'warning',
      occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      companyName: 'Cloud Bites',
      description: 'New Trial Started',
      status: 'trial',
      occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      companyName: 'Spice Route',
      description: 'Failed Payment',
      status: 'failed',
      occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      companyName: 'Urban Eats',
      description: 'New Company Created',
      status: 'created',
      occurredAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
  ],
  quickActions: dashboardQuickActions,
};

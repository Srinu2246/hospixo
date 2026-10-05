import type { OrganizationListResult } from '@/types/organization';

export const organizationSetupCopy = {
  listTitle: 'Organization Management',
  listBreadcrumb: 'Organization List',
  createOrganization: 'Create Organization',
  searchOrganizations: 'Search organization…',
  showingOrganizations: (from: number, to: number, total: number) =>
    `Showing ${from}-${to} of ${total} organizations`,
  filterStatus: 'Status',
  filterSubscription: 'Subscription',
  filterIndustry: 'Industry',
  noOrganizationsMatch: 'No organizations match the selected filters.',
  loadError: 'Failed to load organizations.',
} as const;

export const organizationStatusFilterOptions = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expiring', label: 'Expiring' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disabled', label: 'Disabled' },
] as const;

export const organizationSubscriptionFilterOptions = [
  { value: 'Starter', label: 'Starter' },
  { value: 'Growth', label: 'Growth' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Enterprise', label: 'Enterprise' },
] as const;

export const organizationIndustryFilterOptions = [
  { value: 'Hospitality', label: 'Hospitality' },
  { value: 'Cloud Kitchen', label: 'Cloud Kitchen' },
  { value: 'F&B', label: 'F&B' },
] as const;

export const organizationFallbackList: OrganizationListResult = {
  items: [
    {
      id: 'abc-hospitality',
      name: 'ABC Hospitality',
      status: 'active',
      plan: 'Enterprise',
      industry: 'Hospitality',
      companyCount: 4,
      branchCount: 32,
      createdAt: '2024-07-12T00:00:00.000Z',
    },
    {
      id: 'paradise-group',
      name: 'Paradise Group',
      status: 'active',
      plan: 'Growth',
      industry: 'Hospitality',
      companyCount: 3,
      branchCount: 16,
      createdAt: '2024-07-18T00:00:00.000Z',
    },
    {
      id: 'urban-eats',
      name: 'Urban Eats',
      status: 'trial',
      plan: 'Starter',
      industry: 'Cloud Kitchen',
      companyCount: 1,
      branchCount: 3,
      createdAt: '2024-08-01T00:00:00.000Z',
    },
    {
      id: 'spice-route',
      name: 'Spice Route',
      status: 'suspended',
      plan: 'Growth',
      industry: 'Hospitality',
      companyCount: 2,
      branchCount: 8,
      createdAt: '2024-06-20T00:00:00.000Z',
    },
    {
      id: 'cloud-bites',
      name: 'Cloud Bites',
      status: 'expiring',
      plan: 'Professional',
      industry: 'Cloud Kitchen',
      companyCount: 3,
      branchCount: 11,
      createdAt: '2024-05-15T00:00:00.000Z',
    },
    {
      id: 'mamas-kitchen',
      name: "Mama's Kitchen",
      status: 'active',
      plan: 'Growth',
      industry: 'Hospitality',
      companyCount: 2,
      branchCount: 6,
      createdAt: '2024-07-05T00:00:00.000Z',
    },
    {
      id: 'al-baik-foods',
      name: 'Al Baik Foods',
      status: 'active',
      plan: 'Enterprise',
      industry: 'F&B',
      companyCount: 5,
      branchCount: 42,
      createdAt: '2024-04-10T00:00:00.000Z',
    },
  ],
  total: 7,
  page: 1,
  pageSize: 10,
};

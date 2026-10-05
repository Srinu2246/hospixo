import { routes } from '@/config/routes';

export type OrganisationCompanyRow = Readonly<{
  id: string;
  name: string;
  branches: number;
  employees: number;
  salesToday: number;
  status: 'active' | 'setup' | 'paused';
  href: string;
}>;

export const organisationLandingContent = {
  header: {
    title: 'Organisation overview',
    subtitle: 'Full access across companies, branches, and operational teams.',
    dateRange: 'Today',
  },
  kpis: [
    { key: 'companies', label: 'Companies', value: '4' },
    { key: 'branches', label: 'Branches', value: '18' },
    { key: 'employees', label: 'Employees', value: '246' },
    { key: 'sales', label: 'Sales today', value: '₹12.4L' },
  ],
  companiesTitle: 'Companies',
  companiesHint: 'Open a company to view its branches and operations.',
  companies: [
    {
      id: 'co-1',
      name: 'Hospixo Downtown',
      branches: 5,
      employees: 72,
      salesToday: 420000,
      status: 'active',
      href: routes.dashboard.company,
    },
    {
      id: 'co-2',
      name: 'Cloud Kitchen West',
      branches: 4,
      employees: 51,
      salesToday: 310000,
      status: 'active',
      href: routes.dashboard.company,
    },
    {
      id: 'co-3',
      name: 'Harbour Club',
      branches: 6,
      employees: 88,
      salesToday: 390000,
      status: 'active',
      href: routes.dashboard.company,
    },
    {
      id: 'co-4',
      name: 'Airport Express',
      branches: 3,
      employees: 35,
      salesToday: 120000,
      status: 'setup',
      href: routes.dashboard.company,
    },
  ] satisfies OrganisationCompanyRow[],
} as const;

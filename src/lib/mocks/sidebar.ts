import type { SidebarContext, SidebarUserProfile } from '@/app/sidebar';

export const MOCK_DEFAULT_ROLE = 'Branch manager';

export const MOCK_SIDEBAR_USER: SidebarUserProfile = {
  name: 'Ravi Kumar',
  role: 'Captain',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  email: 'ravi.kumar@hospixo.com',
};

export const MOCK_SIDEBAR_CONTEXT: SidebarContext = {
  organizationName: 'Apollo Healthcare',
  organizationSlug: 'apollo-healthcare',
  companyName: 'Apollo Clinics',
  companySlug: 'apollo-clinics',
  branchName: 'Indiranagar',
  branchSlug: 'indiranagar',
};

export interface MockBranch {
  id: string;
  name: string;
  label?: string;
  slug: string;
  companyId: string;
}

export const MOCK_BRANCHES: MockBranch[] = [
  {
    id: 'branch-1',
    name: 'Indiranagar',
    label: 'Hotel Mayukha Jungle Theme...',
    slug: 'indiranagar',
    companyId: 'comp-1',
  },
  {
    id: 'branch-2',
    name: 'Koramangala',
    slug: 'koramangala',
    companyId: 'comp-1',
  },
  {
    id: 'branch-3',
    name: 'Whitefield',
    slug: 'whitefield',
    companyId: 'comp-2',
  },
  {
    id: 'branch-4',
    name: 'Jayanagar',
    slug: 'jayanagar',
    companyId: 'comp-2',
  },
];

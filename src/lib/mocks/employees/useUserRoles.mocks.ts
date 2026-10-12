import type { UserRoleItem, UserRoleStatsData } from '@/features/employees/user-roles/types';

export const INITIAL_USER_ROLE_STATS: UserRoleStatsData = {
  totalUsers: 124,
  activeNow: 118,
  pendingInvites: 6,
  userRoles: 14,
};

export const ROLE_OPTIONS = [
  'Company Manager',
  'Branch Manager',
  'Inventory',
  'Cashier',
  'Kitchen Staff',
  'Staff',
  'Head Chef',
  'Sommelier',
  'Captain',
  'Waiter',
  'Barista',
  'Accountant',
  'Operations Lead',
  'Shift Supervisor',
  'General Manager',
] as const;

export const BRANCH_OPTIONS = [
  'Downtown HQ',
  'Westside Cafe',
  'Airport Branch',
  'Eastgate Outlet',
  'Northside Bistro',
  'City Center Grill',
] as const;

export const STATUS_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'invited', label: 'Invited' },
  { id: 'disabled', label: 'Disabled' },
] as const;

// Base dataset matching the screenshot exactly
export const INITIAL_USERS: UserRoleItem[] = [
  {
    id: 'usr-1',
    name: 'Marcus Wright',
    email: 'm.marcus@hospixo.com',
    role: 'Branch Manager',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-15',
  },
  {
    id: 'usr-2',
    name: 'Elena Rodriguez',
    email: 'elena.r@hospixo.com',
    role: 'Inventory',
    branch: 'Westside Cafe',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-10',
  },
  {
    id: 'usr-3',
    name: 'David Kim',
    email: 'd.kim@hospixo.com',
    role: 'Cashier',
    branch: 'Airport Branch',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-03-01',
  },
  {
    id: 'usr-4',
    name: 'Jamal Washington',
    email: 'j.wash@hospixo.com',
    role: 'Kitchen Staff',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-03-12',
  },
  {
    id: 'usr-5',
    name: 'Sophie Miller',
    email: 's.miller@hospixo.com',
    role: 'Staff',
    branch: 'Westside Cafe',
    status: 'disabled',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-22',
  },
  {
    id: 'usr-6',
    name: 'Oliver Twist',
    email: 'o.twist@hospixo.com',
    role: 'Kitchen Staff',
    branch: 'Eastgate Outlet',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-18',
  },
  {
    id: 'usr-7',
    name: 'Maya Patel',
    email: 'm.maya@hospixo.com',
    role: 'Cashier',
    branch: 'Westside Cafe',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-03-05',
  },
  {
    id: 'usr-8',
    name: 'Alex Morgan',
    email: 'a.morgan@hospixo.com',
    role: 'Branch Manager',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-08',
  },
  // Additional mock members to complete realistic multi-page dataset (124 total)
  {
    id: 'usr-9',
    name: 'Lucas Silva',
    email: 'l.silva@hospixo.com',
    role: 'Head Chef',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-11',
  },
  {
    id: 'usr-10',
    name: 'Chloe Bennett',
    email: 'c.bennett@hospixo.com',
    role: 'Sommelier',
    branch: 'Westside Cafe',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-14',
  },
  {
    id: 'usr-11',
    name: 'Liam Chen',
    email: 'l.chen@hospixo.com',
    role: 'Captain',
    branch: 'Airport Branch',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-01-20',
  },
  {
    id: 'usr-12',
    name: 'Amara Okafor',
    email: 'a.okafor@hospixo.com',
    role: 'Waiter',
    branch: 'Eastgate Outlet',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-01',
  },
  {
    id: 'usr-13',
    name: 'Noah Williams',
    email: 'n.williams@hospixo.com',
    role: 'Barista',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-04',
  },
  {
    id: 'usr-14',
    name: 'Priya Sharma',
    email: 'p.sharma@hospixo.com',
    role: 'Accountant',
    branch: 'Downtown HQ',
    status: 'active',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-08',
  },
  {
    id: 'usr-15',
    name: 'Daniel Brooks',
    email: 'd.brooks@hospixo.com',
    role: 'Operations Lead',
    branch: 'Westside Cafe',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-15',
  },
  {
    id: 'usr-16',
    name: 'Isabella Rossi',
    email: 'i.rossi@hospixo.com',
    role: 'Shift Supervisor',
    branch: 'Airport Branch',
    status: 'invited',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    createdAt: '2024-02-20',
  },
];

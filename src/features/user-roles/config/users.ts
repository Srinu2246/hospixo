export type UserRole =
  | 'company Manager'
  | 'branch Manager'
  | 'inventory'
  | 'cashier'
  | 'kitchen staff'
  | 'staff'
  | 'Organisation Manager'
  | 'Company Manager'
  | 'Branch Manager'
  | 'Inventory'
  | 'Cashier'
  | 'Kitchen Staff'
  | 'Staff'
  | 'Tenant Admin';

export type UserStatus = 'active' | 'invited' | 'disabled';

export type EmployeeScope = 'organisation' | 'company' | 'branch';

export interface TeamUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  branch: string;
  scope: EmployeeScope;
  status: UserStatus;
  lastActive: string;
  avatarColor: string;
  avatarSrc?: string;
  department?: string;
  startDate?: string;
  employmentType?: string;
  branchId?: number | null;
  companyId?: number | null;
}

const PENDING_INVITATIONS_KEY = 'hospixo.pending-invitations';

export function readPendingInvitations(): TeamUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = sessionStorage.getItem(PENDING_INVITATIONS_KEY);
    if (!stored) return [];
    const invitations = JSON.parse(stored) as TeamUser[];
    return Array.isArray(invitations) ? invitations : [];
  } catch {
    return [];
  }
}

export function savePendingInvitation(user: TeamUser) {
  if (typeof window === 'undefined') return;

  const invitations = readPendingInvitations().filter(
    (invitation) => invitation.email !== user.email,
  );
  sessionStorage.setItem(PENDING_INVITATIONS_KEY, JSON.stringify([...invitations, user]));
}

export const usersStats = {
  totalUsers: 124,
  activeNow: 118,
  pendingInvites: 6,
  userRoles: 14,
};

export const teamUsers: TeamUser[] = [
  {
    id: 'u-sarah-chen',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@example.com',
    phone: '+1 (555) 010-1001',
    role: 'Company Manager',
    branch: 'All Branches',
    scope: 'organisation',
    status: 'active',
    lastActive: '2 mins ago',
    avatarColor: '#2563EB',
    avatarSrc: 'https://i.pravatar.cc/80?u=sarah-chen',
    department: 'Operations',
    startDate: '01/12/2022',
    employmentType: 'Full-time',
  },
  {
    id: 'u-marcus-wright',
    firstName: 'Marcus',
    lastName: 'Wright',
    email: 'marcus.wright@example.com',
    phone: '+1 (555) 010-1002',
    role: 'Branch Manager',
    branch: 'All Branches',
    scope: 'company',
    status: 'active',
    lastActive: '1 hour ago',
    avatarColor: '#0F766E',
    avatarSrc: 'https://i.pravatar.cc/80?u=marcus-wright',
    department: 'Management',
    startDate: '03/08/2023',
    employmentType: 'Full-time',
  },
  {
    id: 'u-priya-nair',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@example.com',
    phone: '+1 (555) 248-0192',
    role: 'Inventory',
    branch: 'Westside Cafe',
    scope: 'branch',
    status: 'active',
    lastActive: '3 hours ago',
    avatarColor: '#7C3AED',
    avatarSrc: 'https://i.pravatar.cc/80?u=priya-nair',
    department: 'Inventory',
    startDate: '06/12/2023',
    employmentType: 'Full-time',
  },
  {
    id: 'u-james-okonkwo',
    firstName: 'James',
    lastName: 'Okonkwo',
    email: 'james.okonkwo@example.com',
    role: 'Kitchen Staff',
    branch: 'Downtown HQ',
    scope: 'branch',
    status: 'active',
    lastActive: 'Yesterday',
    avatarColor: '#EA580C',
    avatarSrc: 'https://i.pravatar.cc/80?u=james-okonkwo',
  },
  {
    id: 'u-david-kim',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@example.com',
    role: 'Cashier',
    branch: 'Airport Branch',
    scope: 'branch',
    status: 'invited',
    lastActive: '—',
    avatarColor: '#0284C7',
    avatarSrc: 'https://i.pravatar.cc/80?u=david-kim',
  },
  {
    id: 'u-elena-vasquez',
    firstName: 'Elena',
    lastName: 'Vasquez',
    email: 'elena.vasquez@example.com',
    role: 'Branch Manager',
    branch: 'Airport Branch',
    scope: 'branch',
    status: 'active',
    lastActive: '5 hours ago',
    avatarColor: '#DB2777',
    avatarSrc: 'https://i.pravatar.cc/80?u=elena-vasquez',
  },
  {
    id: 'u-tom-bradley',
    firstName: 'Tom',
    lastName: 'Bradley',
    email: 'tom.bradley@example.com',
    role: 'Staff',
    branch: 'Westside Cafe',
    scope: 'branch',
    status: 'active',
    lastActive: 'Yesterday',
    avatarColor: '#4F46E5',
    avatarSrc: 'https://i.pravatar.cc/80?u=tom-bradley',
  },
  {
    id: 'u-sophie-miller',
    firstName: 'Sophie',
    lastName: 'Miller',
    email: 'sophie.miller@example.com',
    role: 'Staff',
    branch: 'Westside Cafe',
    scope: 'branch',
    status: 'disabled',
    lastActive: '2 weeks ago',
    avatarColor: '#64748B',
    avatarSrc: 'https://i.pravatar.cc/80?u=sophie-miller',
  },
  {
    id: 'u-marco-rossi',
    firstName: 'Marco',
    lastName: 'Rossi',
    email: 'marco@email.com',
    phone: '+1 (555) 123-4567',
    role: 'Kitchen Staff',
    branch: 'Downtown HQ',
    scope: 'branch',
    status: 'active',
    lastActive: '4 hours ago',
    avatarColor: '#B45309',
    avatarSrc: 'https://i.pravatar.cc/80?u=marco-rossi',
    department: 'Kitchen',
    startDate: '03/15/2024',
    employmentType: 'Full-time',
  },
];

export const branchOptions = [
  'Downtown Branch',
  'Downtown HQ',
  'Westside Cafe',
  'Airport Branch',
  'All Branches',
];

export const roleOptions: UserRole[] = [
  'Tenant Admin',
  'Organisation Manager',
  'Company Manager',
  'Branch Manager',
  'Inventory',
  'Cashier',
  'Kitchen Staff',
  'Staff',
];

export const roleSummaries: Record<string, string> = {
  'Organisation Manager':
    'Full access across all companies and branches: Dashboard, Analytics, User Management, Reports, Settings.',
  'Tenant Admin':
    'Includes access to: Dashboard, Analytics, User Management, Branch Management, Reports, Settings.',
  'Company Manager':
    'Full company access across all branches: Dashboard, Analytics, Staff Management, Branch Operations.',
  'Branch Manager':
    'Includes access to: Dashboard, Analytics, User Management (Partial), Branch Management, Reports.',
  Inventory: 'Includes access to: Dashboard, Inventory, Procurement, Reports.',
  Cashier: 'Includes access to: POS, Transactions, Basic Dashboard.',
  'Kitchen Staff': 'Includes access to: Kitchen Display, Order Prep, Own Schedule.',
  Staff: 'Includes access to: Own shifts, Profile, Basic notifications.',
};

export const loginManager = {
  name: 'Alex Morgan',
  org: 'Hospixo HQ',
  avatarSrc: 'https://i.pravatar.cc/80?u=alex-morgan',
};

export function getTeamUserById(id: string): TeamUser | undefined {
  return teamUsers.find((user) => user.id === id);
}

export function getTeamUserAvatarSrc(user: Pick<TeamUser, 'avatarSrc'>): string | undefined {
  return user.avatarSrc;
}

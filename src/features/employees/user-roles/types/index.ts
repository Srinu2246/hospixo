/**
 * Types and models for the User Roles domain
 */

export type UserStatus = 'active' | 'invited' | 'disabled';

export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: UserStatus;
  avatar?: string;
  createdAt?: string;
}

export interface UserRoleStatsData {
  totalUsers: number;
  activeNow: number;
  pendingInvites: number;
  userRoles: number;
}

export interface UserRoleFilterValues {
  search: string;
  role: string;
  branch: string;
  status: string;
}

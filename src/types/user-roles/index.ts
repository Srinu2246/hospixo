import type { CreateUserMultiformValues } from '@/lib/schemas/user-roles/userrole.schema';

export type ScopeType = 'organization' | 'company' | 'branch';

export type UserStatus = 'active' | 'invited' | 'disabled' | 'inactive';

export interface UserRoleItem {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: UserStatus;
  avatar?: string;
  createdAt?: string;
  company?: string;
  scope?: ScopeType;
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
  company?: string;
}

export interface RoleTemplateItem {
  id: string;
  title: string;
  description: string;
  icon: 'company' | 'restaurant' | 'pos' | 'captain' | 'kitchen';
  roleName: string;
  defaultPermissions?: Record<string, boolean>;
  company?: string;
  branch?: string;
  scope?: ScopeType;
}

export type CreateUserFormValues = CreateUserMultiformValues;

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PermissionCategory {
  id: string;
  title: string;
  permissions: PermissionItem[];
}

export type CreateUserStep = 'template' | 'user-form' | 'permissions' | 'review' | 'success';

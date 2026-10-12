import type { CreateUserMultiformValues } from '../schemas/userrole.schema';

export interface RoleTemplateItem {
  id: string;
  title: string;
  description: string;
  icon: 'company' | 'restaurant' | 'pos' | 'captain' | 'kitchen';
  roleName: string;
  defaultPermissions?: Record<string, boolean>;
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

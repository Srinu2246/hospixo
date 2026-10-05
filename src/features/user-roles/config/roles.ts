import type { AccessLevel, HierarchyAccessLevel } from '@/lib/auth/access-level';

export type RoleTemplateId =
  | 'organisation-manager'
  | 'company-manager'
  | 'branch-manager'
  | 'store-manager'
  | 'procurement'
  | 'finance-approver'
  | 'auditor'
  | 'cashier'
  | 'kitchen-staff'
  | 'general-staff';

/** Hierarchy scope this template belongs to. */
export type RoleTemplateScope = HierarchyAccessLevel;

export interface RoleTemplate {
  id: RoleTemplateId;
  title: string;
  description: string;
  icon:
    | 'shield'
    | 'building'
    | 'store'
    | 'clipboard'
    | 'banknote'
    | 'search'
    | 'card'
    | 'utensils'
    | 'user';
  scope: RoleTemplateScope;
}

export interface PermissionItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  /** When false, permission is gated by subscription/capability — toggle stays disabled. */
  available?: boolean;
}

export interface PermissionGroup {
  id: string;
  title: string;
  permissions: PermissionItem[];
}

export const roleTemplates: RoleTemplate[] = [
  {
    id: 'organisation-manager',
    title: 'Organisation Manager',
    description: 'Full access across all companies and branches',
    icon: 'shield',
    scope: 'organisation',
  },
  {
    id: 'company-manager',
    title: 'Company Manager',
    description: 'Full company access across all branches',
    icon: 'shield',
    scope: 'company',
  },
  {
    id: 'branch-manager',
    title: 'Branch Manager',
    description: 'Branch-level management access',
    icon: 'building',
    scope: 'branch',
  },
  {
    id: 'store-manager',
    title: 'Store Manager',
    description: 'Daily store operations and staff',
    icon: 'store',
    scope: 'branch',
  },
  {
    id: 'procurement',
    title: 'Procurement',
    description: 'Purchase orders & supplier management',
    icon: 'clipboard',
    scope: 'branch',
  },
  {
    id: 'finance-approver',
    title: 'Finance Approver',
    description: 'Financial approvals and reports',
    icon: 'banknote',
    scope: 'branch',
  },
  {
    id: 'auditor',
    title: 'Auditor',
    description: 'Read-only access to all system data',
    icon: 'search',
    scope: 'branch',
  },
  {
    id: 'cashier',
    title: 'Cashier',
    description: 'POS access and transaction management',
    icon: 'card',
    scope: 'branch',
  },
  {
    id: 'kitchen-staff',
    title: 'Kitchen Staff',
    description: 'Kitchen display and order prep',
    icon: 'utensils',
    scope: 'branch',
  },
  {
    id: 'general-staff',
    title: 'General Staff',
    description: 'Basic access to own shifts/details',
    icon: 'user',
    scope: 'branch',
  },
];

/**
 * Role-creation rules by login level:
 * - Organisation: all org / company / branch roles
 * - Company: company + branch roles except company manager
 * - Branch: branch roles except branch manager
 */
export function canCreateRoleTemplate(level: AccessLevel, templateId: RoleTemplateId): boolean {
  if (level === 'organisation') return true;

  if (level === 'company') {
    return templateId !== 'organisation-manager' && templateId !== 'company-manager';
  }

  if (level === 'branch') {
    return (
      templateId !== 'organisation-manager' &&
      templateId !== 'company-manager' &&
      templateId !== 'branch-manager'
    );
  }

  return false;
}

export function getCreatableRoleTemplates(level: AccessLevel): RoleTemplate[] {
  return roleTemplates.filter((template) => canCreateRoleTemplate(level, template.id));
}

/** Default template when opening create-role / add-user for a given level. */
export function getDefaultRoleTemplateId(level: AccessLevel): RoleTemplateId | null {
  const creatable = getCreatableRoleTemplates(level);
  if (creatable.length === 0) return null;

  const preferred: RoleTemplateId =
    level === 'organisation'
      ? 'organisation-manager'
      : level === 'company'
        ? 'branch-manager'
        : 'store-manager';

  return creatable.find((t) => t.id === preferred)?.id ?? creatable[0].id;
}

export const defaultPermissionGroups: PermissionGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    permissions: [
      {
        id: 'view-dashboard',
        label: 'View Dashboard',
        description: 'Access to the main overview and KPI tiles',
        enabled: true,
      },
      {
        id: 'view-analytics',
        label: 'View Analytics',
        description: 'Detailed charts and data trends analysis',
        enabled: true,
      },
    ],
  },
  {
    id: 'user-management',
    title: 'User Management',
    permissions: [
      {
        id: 'create-users',
        label: 'Create Users',
        description: 'Invite and add new members to the system',
        enabled: true,
      },
      {
        id: 'edit-users',
        label: 'Edit Users',
        description: 'Modify existing user details and status',
        enabled: true,
      },
      {
        id: 'delete-users',
        label: 'Delete Users',
        description: 'Remove users permanently from the organization',
        enabled: true,
      },
      {
        id: 'create-templates',
        label: 'Create Templates',
        description: 'Create custom role templates and configure their permissions',
        enabled: true,
      },
      {
        id: 'edit-templates',
        label: 'Edit Templates',
        description: 'Modify existing role templates and permission presets',
        enabled: false,
      },
      {
        id: 'delete-templates',
        label: 'Delete Templates',
        description: 'Remove custom role templates from the organisation',
        enabled: false,
      },
    ],
  },
  {
    id: 'branch-management',
    title: 'Branch Management',
    permissions: [
      {
        id: 'view-branches',
        label: 'View Branches',
        description: 'See details of all connected branch locations',
        enabled: true,
      },
      {
        id: 'manage-branches',
        label: 'Manage Branches',
        description: 'Edit branch info, opening hours, and zones',
        enabled: true,
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    permissions: [
      {
        id: 'view-inventory',
        label: 'View Inventory',
        description: 'Browse stock levels and item catalogues',
        enabled: false,
      },
      {
        id: 'manage-items',
        label: 'Manage Items',
        description: 'Create and update inventory items',
        enabled: false,
      },
    ],
  },
];

/** Review-step defaults matching the Figma review screen. */
export const reviewPermissionOverrides: Record<string, boolean> = {
  'view-dashboard': true,
  'view-analytics': true,
  'create-users': true,
  'edit-users': true,
  'delete-users': false,
  'create-templates': true,
  'edit-templates': false,
  'delete-templates': false,
  'view-branches': false,
  'manage-branches': true,
  'view-inventory': false,
  'manage-items': false,
};

export type PermissionPresetId = 'full-read' | 'standard-manager' | 'view-only' | 'custom';

export interface PermissionPreset {
  id: PermissionPresetId;
  title: string;
  description: string;
  /** When null, leave current toggles (custom setup). */
  overrides: Record<string, boolean> | null;
}

export const permissionPresets: PermissionPreset[] = [
  {
    id: 'full-read',
    title: 'Full Read Access',
    description: 'View everything across modules; no create or edit rights.',
    overrides: {
      'view-dashboard': true,
      'view-analytics': true,
      'create-users': false,
      'edit-users': false,
      'delete-users': false,
      'create-templates': false,
      'edit-templates': false,
      'delete-templates': false,
      'view-branches': true,
      'manage-branches': false,
      'view-inventory': true,
      'manage-items': false,
    },
  },
  {
    id: 'standard-manager',
    title: 'Standard Manager',
    description: 'Day-to-day management with user and branch controls.',
    overrides: {
      'view-dashboard': true,
      'view-analytics': true,
      'create-users': true,
      'edit-users': true,
      'delete-users': false,
      'create-templates': true,
      'edit-templates': true,
      'delete-templates': false,
      'view-branches': true,
      'manage-branches': true,
      'view-inventory': true,
      'manage-items': false,
    },
  },
  {
    id: 'view-only',
    title: 'View Only',
    description: 'Read-only dashboard and branch visibility.',
    overrides: {
      'view-dashboard': true,
      'view-analytics': false,
      'create-users': false,
      'edit-users': false,
      'delete-users': false,
      'create-templates': false,
      'edit-templates': false,
      'delete-templates': false,
      'view-branches': true,
      'manage-branches': false,
      'view-inventory': false,
      'manage-items': false,
    },
  },
  {
    id: 'custom',
    title: 'Custom Setup',
    description: 'Manually set permissions in the next step.',
    overrides: null,
  },
];

export function applyPermissionOverrides(
  groups: PermissionGroup[],
  overrides: Record<string, boolean>,
): PermissionGroup[] {
  return groups.map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      enabled:
        overrides[permission.id] !== undefined ? overrides[permission.id] : permission.enabled,
    })),
  }));
}

export function getTemplateById(id: string | null | undefined): RoleTemplate | undefined {
  if (!id) return undefined;
  return roleTemplates.find((template) => template.id === id);
}

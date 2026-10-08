import type { RoleTemplateId } from './roles';
import type { UserRole } from './users';

/** Shared wizard step labels for Add User / Create Role. */
export const roleWizardSteps = [
  { step: 1 as const, label: 'Select Template' },
  { step: 2 as const, label: 'Configure Permissions' },
  { step: 3 as const, label: 'Review & Save' },
] as const;

/** Default template — prefers API `code` (`branch_manager`). */
export const defaultRoleTemplate = {
  id: 'branch_manager',
  title: 'Branch Manager',
} as const;

/** @deprecated kebab config id — kept for older sessionStorage snapshots */
export const legacyDefaultTemplateId = 'branch-manager' as RoleTemplateId;

/** Shared invite / user-form defaults. */
export const userInviteDefaults = {
  branch: 'Downtown Branch',
  role: 'Branch Manager' as UserRole,
  message: 'Welcome to the team! Here is your access to Hospixo.',
  sendInvite: true,
} as const;

/** Shared personal-detail field labels + placeholders. */
export const userFormFields = {
  firstName: { label: 'First Name', placeholder: 'Enter first name' },
  lastName: { label: 'Last Name', placeholder: 'Enter last name' },
  email: { label: 'Email Address', placeholder: 'e.g. sarah.chen@example.com' },
  username: { label: 'Username', placeholder: 'e.g. srinukummitha' },
  phone: { label: 'Phone Number', placeholder: 'e.g. +919876543210' },
  phoneAlt: { label: 'Phone Number', placeholder: 'e.g. +1 (555) 000-0000' },
  password: {
    label: 'Password',
    placeholder: 'At least 8 characters',
  },
} as const;

export const commonActions = {
  cancel: 'Cancel',
  back: 'Back',
  backToUsersRoles: 'Back to Users & Roles',
  usersRolesCrumb: 'Users & Roles',
} as const;

export const permissionChrome = {
  sectionTitle: 'Permissions',
  roleNameLabel: 'Role Name',
  descriptionLabel: 'Description',
  toggleAll: 'Toggle All',
  enabledCount: (n: number) => `${n} enabled`,
  enabled: 'Enabled',
  disabled: 'Disabled',
} as const;

export const departmentOptions = [
  'Kitchen',
  'Operations',
  'Management',
  'Front of House',
  'Finance',
] as const;

export const employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Seasonal'] as const;

export const extraRoleCodeOptions = [
  'cashier',
  'staff',
  'kitchen_staff',
  'branch_manager',
  'tenant_admin',
] as const;

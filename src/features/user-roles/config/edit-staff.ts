import {
  commonActions,
  departmentOptions,
  employmentTypeOptions,
  extraRoleCodeOptions,
  userFormFields,
} from './shared';

export const editStaffOptions = {
  departments: departmentOptions,
  employmentTypes: employmentTypeOptions,
  extraRoleCodes: extraRoleCodeOptions,
} as const;

export const editStaffDefaults = {
  department: 'Operations' as string,
  employmentType: 'Full-time' as string,
  extraRoleCode: 'cashier' as string,
  fallbackName: 'Staff Member',
};

export const editStaffContent = {
  crumbBack: commonActions.backToUsersRoles,
  titlePrefix: 'Edit Staff —',
  notFound: 'User not found.',
  sections: {
    personal: 'Personal Information',
    employment: 'Employment Details',
    roles: 'Role Assignments',
    status: 'Account status',
  },
  fields: {
    firstName: userFormFields.firstName.label,
    lastName: userFormFields.lastName.label,
    email: userFormFields.email.label,
    phone: userFormFields.phone.label,
    primaryRole: 'Primary Role',
    department: 'Department',
    startDate: 'Start Date',
    employmentType: 'Employment Type',
    assignExtraRole: 'Assign additional role',
  },
  statusLabel: (value: string) => `Status: ${value}`,
  noRoleAssignments: 'No role assignment rows on this user.',
  removeRole: 'Remove',
  assignRole: 'Assign role',
  danger: {
    inactive: 'This employee is inactive. Activate to restore access.',
    active: 'This employee is active. Deactivate to remove access.',
    activate: 'Activate',
    deactivate: 'Deactivate',
    activating: 'Activating…',
    deactivating: 'Deactivating…',
  },
  confirms: {
    activate: 'Activate this staff member?',
    deactivate: 'Deactivate this staff member?',
    removeRole: (code: string) => `Remove role ${code}?`,
  },
  messages: {
    updated: 'Staff member updated.',
    activated: 'Staff member activated.',
    deactivated: 'Staff member deactivated.',
    assignedRole: (code: string) => `Assigned role ${code}.`,
    removedRole: (code: string) => `Removed ${code}.`,
  },
  errors: {
    saveUser: 'Unable to save user.',
    updateRoles: 'Unable to update roles.',
    updateStatus: 'Unable to update status.',
    assignRole: 'Unable to assign role.',
    removeRole: 'Unable to remove role.',
    missingRoleId: 'This role assignment has no id — cannot remove.',
  },
  cancel: commonActions.cancel,
  save: 'Save Changes',
  saving: 'Saving…',
} as const;

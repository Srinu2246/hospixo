import { commonActions, userFormFields, userInviteDefaults } from './shared';

export const createUserDefaults = {
  branch: userInviteDefaults.branch as string,
  role: userInviteDefaults.role as string,
  message: userInviteDefaults.message as string,
  sendInvite: userInviteDefaults.sendInvite as boolean,
  demoFallback: {
    email: 'sarah.chen@example.com',
    firstName: 'Sarah',
    lastName: 'Chen',
  },
};

export const createUserContent = {
  crumbParent: commonActions.usersRolesCrumb,
  crumbCurrent: 'Create User',
  title: 'Create New User',
  subtitle: 'Provide user details and assign their access scope.',
  sections: {
    userDetails: 'User Details',
    assignBranch: 'Assign Branch',
    assignRole: 'Assign Role',
    invitation: 'Invitation Settings',
  },
  fields: {
    ...userFormFields,
    phone: userFormFields.phoneAlt,
  },
  selectBranch: 'Select Branch',
  selectRole: 'Select Role',
  roleSummary: 'Role Summary',
  sendInvite: 'Send invitation email immediately',
  personalMessage: 'Personal Message (Optional)',
  branchHelper: 'The user will only see data for the selected branch.',
  cancel: commonActions.cancel,
  submit: 'Send Invitation',
} as const;

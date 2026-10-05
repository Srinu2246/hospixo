import {
  commonActions,
  defaultRoleTemplate,
  permissionChrome,
  roleWizardSteps,
  userFormFields,
  userInviteDefaults,
} from './shared';

export const addUserStorageKey = 'hospixo.add-user';
export const addUserDraftStaffId = 'u-new-invite';

export const addUserSteps = roleWizardSteps;

export const addUserDefaults = {
  templateId: defaultRoleTemplate.id as string,
  roleName: defaultRoleTemplate.title,
  description: 'Manages staff and inventory at a specific branch level.',
  draftStaffId: addUserDraftStaffId as string,
  user: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    branch: userInviteDefaults.branch as string,
    branchId: null as number | null,
    sendInvite: userInviteDefaults.sendInvite as boolean,
    message: userInviteDefaults.message as string,
  },
};

export const addUserContent = {
  crumbParent: commonActions.usersRolesCrumb,
  crumbCurrent: 'Add User',
  stepperAriaLabel: 'Add user progress',
  template: {
    title: 'Select a Role Template',
    subtitle: 'Choose a starting template to configure specific permissions.',
    createTemplate: 'Create Template',
    scratchPrefix: "Don't see what you need?",
    scratchLink: 'Start from Scratch',
    cancel: commonActions.cancel,
    continue: 'Continue to Create User',
  },
  details: {
    title: 'Create New User',
    subtitle: 'Provide user details and assign their access scope.',
    sections: {
      userDetails: 'User Details',
      assignBranch: 'Assign Branch',
      assignRole: 'Assign Role',
      invitation: 'Invitation Settings',
    },
    fields: userFormFields,
    selectBranch: 'Select Branch',
    selectedRole: 'Selected Role',
    roleSummary: 'Role Summary',
    sendInvite: 'Send invitation email immediately',
    personalMessage: 'Personal Message (Optional)',
    helpers: {
      invitePassword: 'The invitee sets their own password when they accept the invitation.',
      createPassword: 'Account is created immediately with this temporary password (POST /users).',
      branch: 'Select an active branch. Its numeric id is sent as branch_id on create/invite.',
    },
    back: commonActions.back,
    continue: 'Continue to Permissions',
  },
  permissions: {
    ...permissionChrome,
    back: commonActions.back,
    continue: 'Continue to Review',
  },
  review: {
    userSummary: 'User Summary',
    roleSummary: 'Role Summary',
    permissionsSummary: 'Permissions Summary',
    labels: {
      fullName: 'Full Name',
      email: 'Email',
      branch: 'Branch',
      roleName: 'Role Name',
      description: 'Description',
      template: 'Template',
    },
    fallbacks: {
      fullName: 'New staff member',
      roleName: defaultRoleTemplate.title,
      description: addUserDefaults.description,
      empty: '—',
    },
    errors: {
      required: 'First name and email are required.',
      passwordMin: 'Temporary password must be at least 8 characters.',
      branchRequired: 'Select a branch before continuing.',
      inviteFailed: 'Unable to send invitation.',
      createFailed: 'Unable to create user.',
    },
    enabled: permissionChrome.enabled,
    disabled: permissionChrome.disabled,
    back: commonActions.back,
    sendInvitation: 'Send Invitation',
    createUser: 'Create User',
    sending: 'Sending…',
    creating: 'Creating…',
  },
  invitation: {
    title: 'Invitation created',
    summaryTitle: 'Invitation Summary',
    labels: {
      user: 'User',
      assignedRole: 'Assigned Role',
      branch: 'Branch',
      status: 'Status',
    },
    fallbacks: {
      name: 'New staff member',
      role: defaultRoleTemplate.title,
      branch: '—',
      status: 'pending',
    },
    subtitleSent: '. The backend reported the email as sent.',
    subtitlePending: '. If the inbox is empty, use Resend or check org email/SMTP settings.',
    subtitleMissingEmail:
      'Invitation was created, but the email address is missing from this session.',
    subtitleWithEmail: (email: string) => `Invitation recorded for ${email}`,
    missingId: 'Invitation id is missing. Send the invite again from Review.',
    resendFailed: 'Unable to resend invitation.',
    resent: (email: string) => `Resent invitation email to ${email}.`,
    resend: 'Resend email',
    resending: 'Resending…',
    back: commonActions.backToUsersRoles,
    bannerPending:
      'API create can succeed while the accept-link email still depends on backend mail (SMTP / provider) for this org. Check spam, then Resend, or ask backend to confirm mail delivery logs.',
    bannerSent:
      'The invitee should get an email with a link to set their password. Accept page: /invite/accept?token=…',
  },
} as const;

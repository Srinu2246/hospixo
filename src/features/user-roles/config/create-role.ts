import { commonActions, defaultRoleTemplate, permissionChrome, roleWizardSteps } from './shared';

export const createRoleStorageKey = 'hospixo.create-role';

export const createRoleSteps = roleWizardSteps;

export const createRoleDefaults = {
  templateId: defaultRoleTemplate.id as string,
  roleName: defaultRoleTemplate.title as string,
  description: 'Manages staff and inventory at a specific branch level.',
};

export const createRoleContent = {
  crumbParent: commonActions.usersRolesCrumb,
  crumbCurrent: 'Create Role',
  stepperAriaLabel: 'Create role progress',
  template: {
    title: 'Select a Role Template',
    subtitle: 'Choose a starting template to configure specific permissions.',
    createTemplate: 'Create Template',
    scratchPrefix: "Don't see what you need?",
    scratchLink: 'Start from Scratch',
    cancel: commonActions.cancel,
    continue: 'Continue to Permissions',
  },
  permissions: {
    ...permissionChrome,
    back: commonActions.back,
    continue: 'Save Role Access',
  },
  review: {
    roleSummary: 'Role Summary',
    permissionsSummary: 'Permissions Summary',
    labels: {
      roleName: 'Role Name',
      description: 'Description',
      template: 'Template',
    },
    fallbacks: {
      roleName: defaultRoleTemplate.title,
      description: createRoleDefaults.description,
    },
    enabled: permissionChrome.enabled,
    disabled: permissionChrome.disabled,
    back: commonActions.back,
    create: 'Create Role',
  },
} as const;

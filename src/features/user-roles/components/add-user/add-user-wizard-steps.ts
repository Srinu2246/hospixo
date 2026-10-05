import type { WizardStepConfig } from '@/components/shell';
import { routes } from '@/config/routes';

export type AddUserWizardStepId = 'create-user' | 'configure-permissions' | 'review-save';

/**
 * Visual wizard steps for Add User (Figma: Create User → Configure Permissions → Review & Save).
 */
export const addUserWizardSteps: readonly WizardStepConfig[] = [
  {
    id: 'create-user',
    label: 'Create User',
    shortLabel: 'User',
    path: routes.platform.usersRoles.addUser.details,
  },
  {
    id: 'configure-permissions',
    label: 'Configure Permissions',
    shortLabel: 'Permissions',
    path: routes.platform.usersRoles.addUser.permissions,
  },
  {
    id: 'review-save',
    label: 'Review & Save',
    shortLabel: 'Review',
    path: routes.platform.usersRoles.addUser.review,
  },
] as const;

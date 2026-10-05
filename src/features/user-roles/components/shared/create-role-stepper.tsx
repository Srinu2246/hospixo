'use client';

import { useMemo } from 'react';

import { WizardStepper, type WizardStepConfig } from '@/components/shell';
import { useUsersRolesNav } from '@/features/user-roles/hooks/use-users-roles-nav';
import { withRoleScope } from '@/features/user-roles/hooks/use-role-management-level';

export type CreateRoleStepId = 'select-template' | 'permissions' | 'review';

type CreateRoleStepperProps = Readonly<{
  currentStepId: CreateRoleStepId;
  /** When true, permissions step links to the custom template page. */
  customTemplate?: boolean;
  completedThrough?: number;
}>;

export function CreateRoleStepper({
  currentStepId,
  customTemplate = false,
  completedThrough,
}: CreateRoleStepperProps) {
  const { level, createRole } = useUsersRolesNav();

  const steps = useMemo<readonly WizardStepConfig[]>(
    () => [
      {
        id: 'select-template',
        label: 'Select Template',
        shortLabel: 'Template',
        path: withRoleScope(createRole.root, level),
      },
      {
        id: 'permissions',
        label: 'Configure Permissions',
        shortLabel: 'Permissions',
        path: withRoleScope(
          customTemplate ? createRole.customTemplate : createRole.permissions,
          level,
        ),
      },
      {
        id: 'review',
        label: 'Review & Save',
        shortLabel: 'Review',
        path: withRoleScope(createRole.review, level),
      },
    ],
    [createRole, customTemplate, level],
  );

  return (
    <WizardStepper
      steps={steps}
      currentStepId={currentStepId}
      completedThrough={completedThrough}
      ariaLabel="Create role progress"
      enableEditNavigation
    />
  );
}

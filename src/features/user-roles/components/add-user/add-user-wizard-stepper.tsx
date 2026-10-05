'use client';

import { WizardStepper } from '@/components/shell';
import {
  addUserWizardSteps,
  type AddUserWizardStepId,
} from '@/features/user-roles/components/add-user/add-user-wizard-steps';

type AddUserWizardStepperProps = Readonly<{
  currentStepId: AddUserWizardStepId;
  /** Mark steps before this index as done (e.g. 1 after template, on details page). */
  completedThrough?: number;
  enableEditNavigation?: boolean;
}>;

export function AddUserWizardStepper({
  currentStepId,
  completedThrough,
  enableEditNavigation = false,
}: AddUserWizardStepperProps) {
  return (
    <WizardStepper
      steps={addUserWizardSteps}
      currentStepId={currentStepId}
      completedThrough={completedThrough}
      enableEditNavigation={enableEditNavigation}
      ariaLabel="Add user progress"
    />
  );
}

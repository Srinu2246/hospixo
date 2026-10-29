'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { ProgressBar } from '@/components/shared/ui/ProgressBar';
import { colors } from '@/lib/theme/mui/colors';
import {
  userRolesBreadcrumbStripSx,
  userRolesWizardStepperWrapSx,
} from '@/lib/helpers/employees/userRolesLayout';
import type { ProgressStepItem } from '@/components/shared/ui/ProgressBar';
import type { CreateUserStep } from '@/lib/schemas/employees/user-roles/userRolesSchema';

const WIZARD_STEPS: ProgressStepItem[] = [
  { id: 'step-1', label: 'Create User', compactLabel: 'Create' },
  { id: 'step-2', label: 'Configure Permissions', compactLabel: 'Configure' },
  { id: 'step-3', label: 'Review & Save', compactLabel: 'Review' },
];

export interface CreateUserWizardHeaderProps {
  currentStep: CreateUserStep;
  hasFirstName: boolean;
  onExitFlow: () => void;
  onNavigateToStep: (step: CreateUserStep) => void;
}

export function CreateUserWizardHeader({
  currentStep,
  hasFirstName,
  onExitFlow,
  onNavigateToStep,
}: Readonly<CreateUserWizardHeaderProps>) {
  const getActiveStepIndex = (): number => {
    switch (currentStep) {
      case 'user-form':
        return 0;
      case 'permissions':
        return 1;
      case 'review':
        return 2;
      default:
        return 0;
    }
  };

  const getStepLabel = (): string => {
    if (currentStep === 'user-form') return 'Create User';
    if (currentStep === 'permissions') return 'Configure Permissions';
    return 'Review & Save';
  };

  return (
    <>
      {/* Top Breadcrumb Bar */}
      <Box
        sx={{
          ...userRolesBreadcrumbStripSx,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
          borderBottom: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Breadcrumbs
          items={[
            { label: 'Users & Roles', onClick: onExitFlow },
            { label: 'Template', onClick: () => onNavigateToStep('template') },
            {
              label: getStepLabel(),
              active: true,
            },
          ]}
        />
      </Box>

      {/* Global Reusable Stepped Progress Bar */}
      <Box sx={{ ...userRolesWizardStepperWrapSx, flexShrink: 0 }}>
        <ProgressBar
          variant="stepped"
          steps={WIZARD_STEPS}
          activeStep={getActiveStepIndex()}
          onStepClick={(index) => {
            if (index === 0) onNavigateToStep('user-form');
            if (index === 1 && hasFirstName) onNavigateToStep('permissions');
            if (index === 2 && hasFirstName) onNavigateToStep('review');
          }}
        />
      </Box>
    </>
  );
}

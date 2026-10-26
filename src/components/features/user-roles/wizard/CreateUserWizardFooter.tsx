'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import type { CreateUserStep } from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface CreateUserWizardFooterProps {
  currentStep: CreateUserStep;
  isSubmitting: boolean;
  footerTarget: HTMLElement | null;
  onBack: () => void;
  onNext: () => void;
}

export function CreateUserWizardFooter({
  currentStep,
  isSubmitting,
  footerTarget,
  onBack,
  onNext,
}: Readonly<CreateUserWizardFooterProps>) {
  if (currentStep === 'template' || currentStep === 'success') {
    return null;
  }

  const getFooterNextLabel = (): string => {
    if (currentStep === 'user-form') return 'Setup Permissions';
    if (currentStep === 'permissions') return 'Save User Access';
    return 'Save User';
  };

  const getFooterBackLabel = (): string => {
    if (currentStep === 'user-form') return 'Cancel';
    return 'Back';
  };

  const handleNextClick = () => {
    if (currentStep === 'user-form') {
      (
        document.getElementById('create-user-step-one-form') as HTMLFormElement | null
      )?.requestSubmit();
    } else {
      onNext();
    }
  };

  const footerElement = (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
        borderTop: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 -4px 20px rgba(0, 0, 0, 0.5)'
            : '0 -4px 16px rgba(0, 0, 0, 0.05)',
        px: { xs: 2.5, sm: 3 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <ActionButton
        variant="outlined"
        onClick={onBack}
        disabled={isSubmitting}
        sx={{
          height: 38,
          borderRadius: '8px',
          px: 2.5,
          minWidth: 96,
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {getFooterBackLabel()}
      </ActionButton>

      <ActionButton
        variant="primary"
        type="button"
        form={currentStep === 'user-form' ? 'create-user-step-one-form' : undefined}
        onClick={handleNextClick}
        loading={isSubmitting}
        sx={{
          height: 38,
          borderRadius: '8px',
          px: 2.5,
          minWidth: 130,
          bgcolor: colors.primary.default,
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        {getFooterNextLabel()}
      </ActionButton>
    </Box>
  );

  return footerTarget ? createPortal(footerElement, footerTarget) : footerElement;
}

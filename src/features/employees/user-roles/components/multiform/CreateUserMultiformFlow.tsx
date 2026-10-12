'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { ProgressBar } from '@/components/shared/ui/ProgressBar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { colors } from '@/lib/theme/mui/colors';

import type {
  CreateUserStep,
  CreateUserFormValues,
  RoleTemplateItem,
} from '../../types/multiform.types';
import { ROLE_TEMPLATES } from '@/lib/mocks/employees/multiform.mocks';
import { useCreateUserStore } from '@/stores/createUserStore';

import { RoleTemplateSelection } from './RoleTemplateSelection';
import { CreateUserStepOne } from './CreateUserStepOne';
import { ConfigurePermissionsStepTwo } from './ConfigurePermissionsStepTwo';
import { ReviewAndSaveStepThree } from './ReviewAndSaveStepThree';
import { InvitationSuccessStep } from './InvitationSuccessStep';

export interface CreateUserMultiformFlowProps {
  initialStep?: CreateUserStep;
  initialTemplateId?: string;
  onExit?: () => void;
  onUserCreated?: (userValues: CreateUserFormValues) => void;
}

const WIZARD_STEPS = [
  { id: 'step-1', label: 'Create user' },
  { id: 'step-2', label: 'Configure Permissions' },
  { id: 'step-3', label: 'Review & Save' },
] as const;

export function CreateUserMultiformFlow({
  initialStep,
  initialTemplateId,
  onExit,
  onUserCreated,
}: Readonly<CreateUserMultiformFlowProps>) {
  const router = useRouter();
  const pathname = usePathname() || '';

  // Zustand persistent draft state across route steps
  const {
    step: currentStep,
    selectedTemplate,
    formValues,
    categories,
    isSubmitting,
    setStep,
    setSelectedTemplate,
    togglePermission,
    toggleCategoryAll,
    setIsSubmitting,
    reset,
  } = useCreateUserStore();

  // Toast feedback state
  const [toastFeedback, setToastFeedback] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showToast = (message: string, severity: ToastSeverity = 'success') => {
    setToastFeedback({ open: true, message, severity });
  };

  // Compute base route (e.g. '/indiranagar/employees/users-and-roles' or '/users-and-roles')
  const getBaseRoute = () => {
    return (
      pathname.replace(/\/(template|create|permissions|review|success)$/, '') || '/users-and-roles'
    );
  };

  const baseRoute = getBaseRoute();

  // Portal container for page footer rendered outside <main>
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setFooterTarget(document.getElementById('app-shell-footer'));
  }, []);

  // Synchronize step with browser route pathname
  useEffect(() => {
    if (pathname.endsWith('/template')) {
      setStep('template');
    } else if (pathname.endsWith('/create')) {
      setStep('user-form');
    } else if (pathname.endsWith('/permissions')) {
      setStep('permissions');
    } else if (pathname.endsWith('/review')) {
      setStep('review');
    } else if (pathname.endsWith('/success')) {
      setStep('success');
    } else if (initialStep) {
      setStep(initialStep);
    }
  }, [pathname, initialStep, setStep]);

  // Initialize template if passed
  useEffect(() => {
    if (initialTemplateId && !selectedTemplate) {
      const found = ROLE_TEMPLATES.find((t) => t.id === initialTemplateId);
      if (found) setSelectedTemplate(found);
    }
  }, [initialTemplateId, selectedTemplate, setSelectedTemplate]);

  // Navigate to step route helper
  const navigateToStep = (targetStep: CreateUserStep) => {
    setStep(targetStep);
    let targetPath = baseRoute;
    switch (targetStep) {
      case 'template':
        targetPath = `${baseRoute}/template`;
        break;
      case 'user-form':
        targetPath = `${baseRoute}/create`;
        break;
      case 'permissions':
        targetPath = `${baseRoute}/permissions`;
        break;
      case 'review':
        targetPath = `${baseRoute}/review`;
        break;
      case 'success':
        targetPath = `${baseRoute}/success`;
        break;
    }
    router.push(targetPath);
  };

  // Exit flow helper
  const handleExitFlow = () => {
    if (onExit) {
      onExit();
    } else {
      router.push(baseRoute);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (template: RoleTemplateItem) => {
    setSelectedTemplate(template);
    navigateToStep('user-form');
  };

  // Final submission handler
  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onUserCreated?.(formValues);
      showToast(`Invitation sent successfully to ${formValues.email || 'user'}!`, 'success');
      navigateToStep('success');
    }, 600);
  };

  const handleRestart = () => {
    reset();
    showToast('Ready to assign a new team member.', 'info');
    navigateToStep('template');
  };

  // Calculate current index for ProgressBar
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

  // Handle Fixed Footer Actions
  const handleFooterBack = () => {
    if (currentStep === 'user-form') {
      handleExitFlow();
    } else if (currentStep === 'permissions') {
      navigateToStep('user-form');
    } else if (currentStep === 'review') {
      navigateToStep('permissions');
    }
  };

  const handleFooterNext = () => {
    if (currentStep === 'permissions') {
      navigateToStep('review');
    } else if (currentStep === 'review') {
      handleFinalSubmit();
    }
  };

  const getFooterNextLabel = () => {
    if (currentStep === 'user-form') return 'Setup Permissions';
    if (currentStep === 'permissions') return 'Save User Access';
    return 'Send Invitation';
  };

  const getFooterBackLabel = () => {
    if (currentStep === 'user-form') return 'Cancel';
    return 'Back';
  };

  return (
    <>
      {currentStep === 'template' && (
        <RoleTemplateSelection
          onSelectTemplate={handleSelectTemplate}
          onCreateRoleClick={() => router.push(`${baseRoute}/custom-template`)}
          onBackToUsers={handleExitFlow}
        />
      )}

      {currentStep === 'success' && (
        <InvitationSuccessStep
          formValues={formValues}
          onGoToDashboard={handleExitFlow}
          onAssignNewStaff={handleRestart}
        />
      )}

      {currentStep !== 'template' && currentStep !== 'success' && (
        <Box
          sx={{
            width: '100%',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Top Header & Breadcrumbs (Stationary) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3, flexShrink: 0 }}>
            <Breadcrumbs
              items={[
                { label: 'Users & Roles', onClick: handleExitFlow },
                { label: 'Template', onClick: () => navigateToStep('template') },
                {
                  label:
                    currentStep === 'user-form'
                      ? 'Create User'
                      : currentStep === 'permissions'
                        ? 'Configure Permissions'
                        : 'Review & Save',
                  active: true,
                },
              ]}
            />

            {/* Global Reusable Stepped Progress Bar */}
            <ProgressBar
              variant="stepped"
              steps={WIZARD_STEPS}
              activeStep={getActiveStepIndex()}
              onStepClick={(index) => {
                if (index === 0) navigateToStep('user-form');
                if (index === 1 && formValues.firstName) navigateToStep('permissions');
                if (index === 2 && formValues.firstName) navigateToStep('review');
              }}
            />
          </Box>

          {/* Main Form Content Area */}
          <Box sx={{ flex: 1, width: '100%', pb: 3 }}>
            {currentStep === 'user-form' && (
              <CreateUserStepOne onValidSubmit={() => navigateToStep('permissions')} />
            )}

            {currentStep === 'permissions' && (
              <ConfigurePermissionsStepTwo
                categories={categories}
                onTogglePermission={togglePermission}
                onToggleCategoryAll={toggleCategoryAll}
              />
            )}

            {currentStep === 'review' && (
              <ReviewAndSaveStepThree
                formValues={formValues}
                selectedTemplate={selectedTemplate}
                categories={categories}
                onEditSection={(section) => navigateToStep(section)}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Page Action Footer Bar rendered outside <main> via #app-shell-footer portal */}
      {currentStep !== 'template' &&
        currentStep !== 'success' &&
        (() => {
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
                onClick={handleFooterBack}
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
                type={currentStep === 'user-form' ? 'submit' : 'button'}
                form={currentStep === 'user-form' ? 'create-user-step-one-form' : undefined}
                onClick={currentStep !== 'user-form' ? handleFooterNext : undefined}
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
        })()}

      {/* Global Toast Feedback */}
      <Toast
        open={toastFeedback.open}
        message={toastFeedback.message}
        severity={toastFeedback.severity}
        onClose={() => setToastFeedback((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}

export default CreateUserMultiformFlow;

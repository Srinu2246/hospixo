'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import { Loading } from '@/components/shared/ui/Loading';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';

import {
  parseRolePermissionsToCategories,
  resolveRoleId,
  resolveScopeFromPathname,
  getUsersAndRolesBaseRoute,
  type CreateUserStep,
  type CreateUserFormValues,
  type RoleTemplateItem,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { useCreateUserStore } from '@/stores/createUserStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import {
  clearCreateUserFormDraft,
  resolveCreateUserFormDraftStorageKey,
  useCreateStaffUser,
  useCreateUserFormDraft,
  useEmployeeDirectory,
  useRoleCatalogQuery,
  useRolePermissions,
} from '@/lib/hooks/employees/user-roles';
import { resolveEmployeeDirectoryOptions } from '@/lib/helpers/employees/userRolesHelpers';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';

import {
  RoleTemplateSelection,
  CreateUserStepOne,
  ConfigurePermissionsStepTwo,
  ReviewAndSaveStepThree,
  InvitationSuccessStep,
} from '@/components/features/user-roles';
import { CreateUserWizardHeader } from '@/components/features/user-roles/wizard/CreateUserWizardHeader';
import { CreateUserWizardFooter } from '@/components/features/user-roles/wizard/CreateUserWizardFooter';

export interface CreateUserMultiformFlowProps {
  initialStep?: CreateUserStep;
  initialTemplateId?: string;
  scope?: ScopeType;
  companyName?: string;
  onExit?: () => void;
  onUserCreated?: (userValues: CreateUserFormValues) => void;
}

export function CreateUserMultiformFlow({
  initialStep,
  scope,
  companyName,
  onExit,
  onUserCreated,
}: Readonly<CreateUserMultiformFlowProps>) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const effectiveCompanyName = useResolvedCompanyName(companyName);

  const resolvedScope = resolveScopeFromPathname(pathname, scope);

  const [toastFeedback, setToastFeedback] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: '',
    severity: 'error',
  });

  const showToast = (message: string, severity: ToastSeverity = 'error') => {
    setToastFeedback({ open: true, message, severity });
  };

  const {
    step: storeStep,
    selectedTemplate,
    selectedRoleId,
    formValues,
    categories,
    isSubmitting,
    setStep,
    setSelectedTemplate,
    setRoleAndDescription,
    updateFormField,
    togglePermission,
    toggleCategoryAll,
    setIsSubmitting,
    setCategories,
    setScope,
    reset,
  } = useCreateUserStore();

  const getStepFromPathname = (): CreateUserStep | undefined => {
    if (pathname.endsWith('/template')) return 'template';
    if (pathname.endsWith('/create')) return 'user-form';
    if (pathname.endsWith('/permissions')) return 'permissions';
    if (pathname.endsWith('/review')) return 'review';
    if (pathname.endsWith('/success')) return 'success';
    return initialStep;
  };

  const currentStep = getStepFromPathname() || storeStep || 'template';

  const createStaffUser = useCreateStaffUser();
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id ?? undefined);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);
  const contextOrgId = useSidebarStore((state) => state.context.organizationId);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);
  const role = useSidebarStore((state) => state.role || state.user?.role || '');
  const authScope = useSidebarStore((state) => state.account?.scope ?? '');

  const organizationId = contextOrgId ?? accountOrgId;

  const baseRoute = useMemo(
    () => getUsersAndRolesBaseRoute(pathname, resolvedScope),
    [pathname, resolvedScope],
  );

  const formDraftStorageKey = useMemo(
    () => resolveCreateUserFormDraftStorageKey(resolvedScope, baseRoute),
    [baseRoute, resolvedScope],
  );

  useEffect(() => {
    setScope(resolvedScope);
  }, [resolvedScope, setScope]);

  const { isDraftReady } = useCreateUserFormDraft(formDraftStorageKey, {
    enabled: currentStep !== 'success',
    currentStep,
  });

  const wizardStepsNeedDraft =
    currentStep === 'user-form' || currentStep === 'permissions' || currentStep === 'review';

  const directoryQuery = useMemo(
    () =>
      resolveEmployeeDirectoryOptions({
        wizardScope: resolvedScope,
        contextCompanyId,
        accountCompanyId,
        role,
        authScope,
      }),
    [resolvedScope, contextCompanyId, accountCompanyId, role, authScope],
  );
  const directory = useEmployeeDirectory(organizationId, directoryQuery.companyId, {
    scope: directoryQuery.directoryScope,
  });

  const resolvedBranchId = useMemo(() => {
    if (contextBranchId != null) return contextBranchId;
    if (accountBranchId != null) return accountBranchId;
    if (!formValues.branch?.trim()) return undefined;
    const branchName = formValues.branch.trim().toLowerCase();
    const matched = directory.data?.branches?.find(
      (b) => b.name?.trim().toLowerCase() === branchName || String(b.id) === branchName,
    );
    return matched?.id != null ? Number(matched.id) : undefined;
  }, [contextBranchId, accountBranchId, formValues.branch, directory.data?.branches]);

  const rolesCatalogQuery = useRoleCatalogQuery(resolvedScope);
  const roleCatalog = useMemo(() => {
    return Array.isArray(rolesCatalogQuery.data) ? rolesCatalogQuery.data : [];
  }, [rolesCatalogQuery.data]);

  const activeRoleName = useMemo(() => {
    return formValues.role || selectedTemplate?.roleName || 'Branch Admin';
  }, [formValues.role, selectedTemplate?.roleName]);

  const currentRoleCatalogItem = useMemo(() => {
    return roleCatalog.find(
      (item) =>
        item.name.toLowerCase() === activeRoleName.toLowerCase() ||
        item.code?.toLowerCase() === activeRoleName.toLowerCase() ||
        (selectedRoleId != null && String(item.id) === String(selectedRoleId)),
    );
  }, [roleCatalog, activeRoleName, selectedRoleId]);

  const resolvedRoleId = useMemo(() => {
    if (selectedRoleId != null && selectedRoleId !== '') {
      return selectedRoleId;
    }
    if (currentRoleCatalogItem?.id != null) {
      return currentRoleCatalogItem.id;
    }
    const resolved = resolveRoleId(activeRoleName, roleCatalog);
    if (resolved != null) {
      return resolved;
    }
    if (selectedTemplate?.id && !isNaN(Number(selectedTemplate.id))) {
      return selectedTemplate.id;
    }
    return undefined;
  }, [selectedRoleId, currentRoleCatalogItem, activeRoleName, roleCatalog, selectedTemplate]);

  const resolvedRoleDescription = useMemo(() => {
    return (
      currentRoleCatalogItem?.description ||
      selectedTemplate?.description ||
      'Manages staff and inventory at a specific branch level.'
    );
  }, [currentRoleCatalogItem?.description, selectedTemplate]);

  const rolePermissionsQuery = useRolePermissions(resolvedRoleId, {
    scope: resolvedScope,
    companyId: contextCompanyId ?? accountCompanyId,
    branchId: resolvedBranchId ?? contextBranchId ?? accountBranchId,
  });

  useEffect(() => {
    if (resolvedRoleId == null || !rolePermissionsQuery.data) return;
    setCategories(parseRolePermissionsToCategories(rolePermissionsQuery.data));
  }, [resolvedRoleId, rolePermissionsQuery.data, setCategories]);

  const effectiveCategories = categories;

  const footerTarget = useAppShellFooterTarget();

  const navigateToStep = (nextStep: CreateUserStep) => {
    setStep(nextStep);
    const stepRouteMap: Record<CreateUserStep, string> = {
      template: `${baseRoute}/template`,
      'user-form': `${baseRoute}/create`,
      permissions: `${baseRoute}/permissions`,
      review: `${baseRoute}/review`,
      success: `${baseRoute}/success`,
    };
    router.push(stepRouteMap[nextStep] || `${baseRoute}/create`);
  };

  const handleSelectTemplate = (template: RoleTemplateItem) => {
    setSelectedTemplate(template);
    const matchedCatalogItem = roleCatalog.find(
      (r) =>
        r.name.toLowerCase() === template.roleName.toLowerCase() ||
        r.code?.toLowerCase() === template.roleName.toLowerCase() ||
        String(r.id) === String(template.id),
    );
    const resolvedId = matchedCatalogItem?.id ?? template.id;
    const finalDescription = matchedCatalogItem?.description || template.description;
    setRoleAndDescription(template.roleName, finalDescription, resolvedId);
    navigateToStep('user-form');
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const activeCategories = effectiveCategories;
      const ids = {
        organizationId: organizationId != null ? Number(organizationId) : undefined,
        companyId:
          contextCompanyId != null
            ? Number(contextCompanyId)
            : accountCompanyId != null
              ? Number(accountCompanyId)
              : undefined,
        branchId:
          resolvedBranchId != null
            ? Number(resolvedBranchId)
            : contextBranchId != null
              ? Number(contextBranchId)
              : accountBranchId != null
                ? Number(accountBranchId)
                : undefined,
      };

      await createStaffUser.mutateAsync({
        values: formValues,
        categories: activeCategories,
        ids,
      });

      clearCreateUserFormDraft(formDraftStorageKey);
      onUserCreated?.(formValues);
      navigateToStep('success');
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitFlow = () => {
    clearCreateUserFormDraft(formDraftStorageKey);
    reset(resolvedScope);
    onExit?.();
    router.push(baseRoute);
  };

  const handleRestart = () => {
    clearCreateUserFormDraft(formDraftStorageKey);
    reset(resolvedScope);
    navigateToStep('template');
  };

  const handleFooterBack = () => {
    if (currentStep === 'user-form') {
      navigateToStep('template');
    } else if (currentStep === 'permissions') {
      navigateToStep('user-form');
    } else if (currentStep === 'review') {
      navigateToStep('permissions');
    }
  };

  const handleFooterNext = () => {
    if (currentStep === 'permissions') {
      if (!activeRoleName || !activeRoleName.trim()) {
        showToast('Role name cannot be empty. Please enter a valid role name.', 'error');
        return;
      }
      navigateToStep('review');
    } else if (currentStep === 'review') {
      handleFinalSubmit();
    }
  };

  return (
    <>
      {currentStep === 'template' && (
        <RoleTemplateSelection
          onSelectTemplate={handleSelectTemplate}
          onCreateRoleClick={() => router.push(`${baseRoute}/custom-template`)}
          onBackToUsers={handleExitFlow}
          scope={resolvedScope}
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
            flex: 1,
          }}
        >
          <CreateUserWizardHeader
            currentStep={currentStep}
            hasFirstName={Boolean(formValues.firstName)}
            onExitFlow={handleExitFlow}
            onNavigateToStep={navigateToStep}
          />

          <Box sx={{ flex: 1, width: '100%', pb: 3 }}>
            {wizardStepsNeedDraft && !isDraftReady ? <Loading /> : null}
            {currentStep === 'user-form' && isDraftReady && (
              <CreateUserStepOne
                key={formDraftStorageKey}
                onValidSubmit={() => navigateToStep('permissions')}
                scope={resolvedScope}
                companyName={effectiveCompanyName}
              />
            )}

            {currentStep === 'permissions' && isDraftReady && (
              <ConfigurePermissionsStepTwo
                categories={effectiveCategories}
                onTogglePermission={togglePermission}
                onToggleCategoryAll={toggleCategoryAll}
                roleName={activeRoleName}
                roleDescription={selectedTemplate?.description || resolvedRoleDescription}
                onRoleNameChange={(name) => updateFormField('role', name)}
                onRoleDescriptionChange={(desc) =>
                  setRoleAndDescription(activeRoleName, desc, resolvedRoleId)
                }
              />
            )}

            {currentStep === 'review' && isDraftReady && (
              <ReviewAndSaveStepThree
                formValues={formValues}
                selectedTemplate={
                  selectedTemplate
                    ? {
                        ...selectedTemplate,
                        description: selectedTemplate.description || resolvedRoleDescription,
                      }
                    : {
                        id: resolvedRoleId ? String(resolvedRoleId) : 'custom-role',
                        title: activeRoleName,
                        description: resolvedRoleDescription,
                        icon: 'restaurant',
                        roleName: activeRoleName,
                      }
                }
                categories={effectiveCategories}
                onEditSection={(section) => navigateToStep(section)}
              />
            )}
          </Box>
        </Box>
      )}

      <CreateUserWizardFooter
        currentStep={currentStep}
        isSubmitting={isSubmitting}
        footerTarget={footerTarget}
        onBack={handleFooterBack}
        onNext={handleFooterNext}
      />

      <Toast
        open={toastFeedback.open}
        message={toastFeedback.message}
        severity={toastFeedback.severity}
        onClose={() => setToastFeedback((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}

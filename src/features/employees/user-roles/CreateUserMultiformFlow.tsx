'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';

import {
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
  autoEnableRolePermissions,
  extractAssignedPermissionKeys,
  mergePermissionCategories,
} from '@/lib/helpers/employees/userRolesHelpers';
import {
  useCreateStaffUser,
  useEmployeeDirectory,
  useGroupedPermissions,
  useRoleCatalogQuery,
  useRolePermissions,
} from '@/lib/hooks/employees/user-roles';

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
  onExit,
  onUserCreated,
}: Readonly<CreateUserMultiformFlowProps>) {
  const router = useRouter();
  const pathname = usePathname() || '';

  const resolvedScope = resolveScopeFromPathname(pathname, scope);

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

  const groupedPermissions = useGroupedPermissions();
  const createStaffUser = useCreateStaffUser();
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const accountCompanyId = useSidebarStore((state) => state.account?.company_id ?? undefined);
  const accountBranchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);
  const contextOrgId = useSidebarStore((state) => state.context.organizationId);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const contextBranchId = useSidebarStore((state) => state.context.branchId);

  const organizationId = contextOrgId ?? accountOrgId;
  const directoryCompanyId =
    resolvedScope === 'company' || resolvedScope === 'branch'
      ? (contextCompanyId ?? accountCompanyId)
      : undefined;
  const directory = useEmployeeDirectory(organizationId, directoryCompanyId);

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

  const effectiveCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    if (!groupedPermissions.data?.length) return [];
    const merged = mergePermissionCategories([], groupedPermissions.data);
    if (rolePermissionsQuery.data && resolvedRoleId != null) {
      const assignedKeys = extractAssignedPermissionKeys(rolePermissionsQuery.data);
      if (assignedKeys.size > 0) {
        return autoEnableRolePermissions(merged, assignedKeys);
      }
    }
    return merged;
  }, [categories, groupedPermissions.data, rolePermissionsQuery.data, resolvedRoleId]);

  const footerTarget = useAppShellFooterTarget();

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

  const baseRoute = getUsersAndRolesBaseRoute(pathname, resolvedScope);

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

      onUserCreated?.(formValues);
      showToast('User created and invitation sent successfully!', 'success');
      navigateToStep('success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitFlow = () => {
    reset();
    onExit?.();
    router.push(baseRoute);
  };

  const handleRestart = () => {
    reset();
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
            {currentStep === 'user-form' && (
              <CreateUserStepOne
                onValidSubmit={() => navigateToStep('permissions')}
                scope={resolvedScope}
              />
            )}

            {currentStep === 'permissions' && (
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

            {currentStep === 'review' && (
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

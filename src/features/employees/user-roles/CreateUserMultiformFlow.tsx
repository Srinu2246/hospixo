'use client';

import React, { useMemo, useState } from 'react';
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
import {
  isFallbackEntityName,
  resolveEmployeeDirectoryOptions,
} from '@/lib/helpers/employees/userRolesHelpers';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';
import { useResolvedBranchName } from '@/lib/hooks/useResolvedBranchName';

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
  const resolvedScope = resolveScopeFromPathname(pathname, scope);
  const effectiveCompanyName = useResolvedCompanyName(companyName, { scope: resolvedScope });

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

  const effectiveBranchName = useResolvedBranchName(formValues.branch, { scope: resolvedScope });

  const getStepFromPathname = (): CreateUserStep | undefined => {
    if (pathname.endsWith('/template')) return 'template';
    if (pathname.endsWith('/create')) return 'user-form';
    if (pathname.endsWith('/permissions')) return 'permissions';
    if (pathname.endsWith('/review')) return 'review';
    if (pathname.endsWith('/success')) return 'success';
    return initialStep;
  };

  const currentStep =
    storeStep === 'success' ? 'success' : getStepFromPathname() || storeStep || 'template';

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

  if (useCreateUserStore.getState().scope !== resolvedScope) {
    setScope(resolvedScope);
  }

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
    const branchCandidate =
      (formValues.branch && !isFallbackEntityName(formValues.branch)
        ? formValues.branch
        : undefined) ??
      (effectiveBranchName && !isFallbackEntityName(effectiveBranchName)
        ? effectiveBranchName
        : undefined);
    if (branchCandidate?.trim()) {
      const branchName = branchCandidate.trim().toLowerCase();
      const matched = directory.data?.branches?.find(
        (b) => b.name?.trim().toLowerCase() === branchName || String(b.id) === branchName,
      );
      if (matched?.id != null) return Number(matched.id);
    }
    if (contextBranchId != null) return Number(contextBranchId);
    if (accountBranchId != null) return Number(accountBranchId);
    if (directory.data?.branches?.[0]?.id != null) {
      return Number(directory.data.branches[0].id);
    }
    return undefined;
  }, [contextBranchId, accountBranchId, effectiveBranchName, formValues.branch, directory.data]);

  const resolvedCompanyId = useMemo(() => {
    // 1. If resolvedBranchId is known, the branch's companyId is the absolute authority
    if (resolvedBranchId != null) {
      const branchObj = directory.data?.branches?.find(
        (b) => Number(b.id) === Number(resolvedBranchId),
      );
      if (branchObj?.companyId != null) return Number(branchObj.companyId);
    }

    // 2. If formValues.branch is specified, look up that branch's companyId
    if (formValues.branch?.trim() && !isFallbackEntityName(formValues.branch)) {
      const branchName = formValues.branch.trim().toLowerCase();
      const matched = directory.data?.branches?.find(
        (b) => b.name?.trim().toLowerCase() === branchName || String(b.id) === branchName,
      );
      if (matched?.companyId != null) return Number(matched.companyId);
    }

    // 3. Match formValues.company or effectiveCompanyName against directory companies
    const companyCandidate =
      (formValues.company && !isFallbackEntityName(formValues.company)
        ? formValues.company
        : undefined) ??
      (effectiveCompanyName && !isFallbackEntityName(effectiveCompanyName)
        ? effectiveCompanyName
        : undefined);
    if (companyCandidate?.trim()) {
      const trimmed = companyCandidate.trim().toLowerCase();
      const matched = directory.data?.companies?.find(
        (c) => c.name?.trim().toLowerCase() === trimmed || String(c.id) === trimmed,
      );
      if (matched?.id != null) return Number(matched.id);
    }

    // 4. In company scope, fall back to context / account company ID
    if (contextCompanyId != null) return Number(contextCompanyId);
    if (accountCompanyId != null) return Number(accountCompanyId);

    // 5. Fallback to first company in directory if available
    const firstCompanyId = directory.data?.companies?.[0]?.id;
    if (firstCompanyId != null) return Number(firstCompanyId);
    return undefined;
  }, [
    resolvedBranchId,
    formValues.branch,
    formValues.company,
    effectiveCompanyName,
    directory.data,
    contextCompanyId,
    accountCompanyId,
  ]);

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
    const roleCandidate = formValues.role || selectedTemplate?.roleName;
    if (roleCandidate?.trim()) {
      const trimmed = roleCandidate.trim().toLowerCase();
      const matched = roleCatalog.find(
        (r) =>
          r.name.toLowerCase() === trimmed ||
          r.code?.toLowerCase() === trimmed ||
          (selectedRoleId != null && String(r.id) === String(selectedRoleId)),
      );
      if (matched?.id != null) return matched.id;
      const byName = resolveRoleId(roleCandidate.trim(), roleCatalog);
      if (byName != null) return byName;
    }
    if (selectedRoleId != null && selectedRoleId !== '') {
      return selectedRoleId;
    }
    if (currentRoleCatalogItem?.id != null) {
      return currentRoleCatalogItem.id;
    }
    if (selectedTemplate?.id && !isNaN(Number(selectedTemplate.id))) {
      return selectedTemplate.id;
    }
    return undefined;
  }, [formValues.role, selectedTemplate, roleCatalog, selectedRoleId, currentRoleCatalogItem]);

  const resolvedRoleDescription = useMemo(() => {
    return (
      currentRoleCatalogItem?.description ||
      selectedTemplate?.description ||
      'Manages staff and inventory at a specific branch level.'
    );
  }, [currentRoleCatalogItem?.description, selectedTemplate]);

  const rolePermissionsQuery = useRolePermissions(resolvedRoleId, {
    scope: resolvedScope,
    companyId: resolvedCompanyId ?? contextCompanyId ?? accountCompanyId,
    branchId:
      resolvedScope === 'branch'
        ? (resolvedBranchId ?? contextBranchId ?? accountBranchId)
        : undefined,
  });

  const permissionsData = rolePermissionsQuery.data;
  const rolePermissionsCategories = useMemo(() => {
    if (!permissionsData) return [];
    return parseRolePermissionsToCategories(permissionsData);
  }, [permissionsData]);

  const effectiveCategories = useMemo(() => {
    if (rolePermissionsCategories.length > 0) {
      if (categories.length > 0) {
        const userToggles = new Map<string, boolean>();
        categories.forEach((cat) => {
          cat.permissions.forEach((perm) => {
            userToggles.set(perm.id, perm.enabled);
            if (perm.code) userToggles.set(perm.code, perm.enabled);
          });
        });
        return rolePermissionsCategories.map((cat) => ({
          ...cat,
          permissions: cat.permissions.map((perm) => {
            const toggle =
              userToggles.get(perm.id) ?? (perm.code ? userToggles.get(perm.code) : undefined);
            return toggle !== undefined ? { ...perm, enabled: toggle } : perm;
          }),
        }));
      }
      return rolePermissionsCategories;
    }
    return [];
  }, [rolePermissionsCategories, categories]);

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
        organizationId:
          organizationId != null
            ? Number(organizationId)
            : contextOrgId != null
              ? Number(contextOrgId)
              : accountOrgId != null
                ? Number(accountOrgId)
                : 1,
        companyId:
          resolvedCompanyId != null
            ? Number(resolvedCompanyId)
            : contextCompanyId != null
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
      setStep('success');
      navigateToStep('success');
    } catch (err) {
      console.error('Failed to create user:', err);
      const msg =
        err instanceof Error ? err.message : 'Failed to create user. Please check required fields.';
      showToast(msg, 'error');
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

            {currentStep === 'permissions' &&
              isDraftReady &&
              (rolePermissionsQuery.isLoading && effectiveCategories.length === 0 ? (
                <Loading />
              ) : (
                <ConfigurePermissionsStepTwo
                  categories={effectiveCategories}
                  onTogglePermission={(categoryId, permissionId) => {
                    if (categories.length === 0 && effectiveCategories.length > 0) {
                      setCategories(effectiveCategories);
                    }
                    togglePermission(categoryId, permissionId);
                  }}
                  onToggleCategoryAll={(categoryId, enableAll) => {
                    if (categories.length === 0 && effectiveCategories.length > 0) {
                      setCategories(effectiveCategories);
                    }
                    toggleCategoryAll(categoryId, enableAll);
                  }}
                  roleName={activeRoleName}
                  roleDescription={selectedTemplate?.description || resolvedRoleDescription}
                  onRoleNameChange={(name) => updateFormField('role', name)}
                  onRoleDescriptionChange={(desc) =>
                    setRoleAndDescription(activeRoleName, desc, resolvedRoleId)
                  }
                />
              ))}

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

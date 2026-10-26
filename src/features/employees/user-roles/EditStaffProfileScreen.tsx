'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';

import { Card } from '@/components/shared/ui/Card';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { colors } from '@/lib/theme/mui/colors';

import {
  staffProfileSchema,
  isUserEditDisabled,
  resolveScopeFromPathname,
  getUsersAndRolesBaseRoute,
  type StaffProfileFormValues,
  type PermissionCategory,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  isFallbackEntityName,
  togglePermissionCategory,
  toggleAllInCategory,
} from '@/lib/helpers/employees/userRolesHelpers';
import { useStaffProfile } from '@/lib/hooks/employees/user-roles';
import { useResolvedCompanyName } from '@/lib/hooks/useResolvedCompanyName';
import { useResolvedBranchName } from '@/lib/hooks/useResolvedBranchName';
import { useUserRolesUiStore } from '@/stores/userRolesUiStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { StaffProfileHeader } from '@/components/features/user-roles/profile/StaffProfileHeader';
import { StaffProfileBasicInfoSection } from '@/components/features/user-roles/profile/StaffProfileBasicInfoSection';
import { StaffProfileAccountStatusCard } from '@/components/features/user-roles/profile/StaffProfileAccountStatusCard';
import { StaffProfileRoleSection } from '@/components/features/user-roles/profile/StaffProfileRoleSection';
import { StaffProfileStatusModals } from '@/components/features/user-roles/profile/StaffProfileStatusModals';
import { StaffProfileFooter } from '@/components/features/user-roles/profile/StaffProfileFooter';

export interface EditStaffProfileScreenProps {
  initialMode?: 'view' | 'edit';
  onBack?: () => void;
  onSave?: (values: StaffProfileFormValues, permissions: PermissionCategory[]) => void;
  scope?: ScopeType;
  companyName?: string;
}

export function EditStaffProfileScreen({
  initialMode = 'edit',
  onBack,
  onSave,
  scope,
  companyName,
}: Readonly<EditStaffProfileScreenProps>) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();

  const queryUserId = searchParams?.get('id') || searchParams?.get('userId') || null;
  const storeSelectedUserId = useUserRolesUiStore((state) => state.selectedUserId);
  const setSelectedUserId = useUserRolesUiStore((state) => state.setSelectedUserId);

  if (queryUserId && queryUserId !== storeSelectedUserId) {
    setSelectedUserId(queryUserId);
  }

  const resolvedScope = resolveScopeFromPathname(pathname, scope);

  const [savedUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hospixo_last_user_id');
    }
    return null;
  });

  const selectedUserId = queryUserId || storeSelectedUserId || savedUserId;

  const staffProfile = useStaffProfile(selectedUserId, { scope: resolvedScope });
  const userProfile = staffProfile.profile;
  const userItem = staffProfile.userItem;
  const rawUser = staffProfile.rawUser as { company?: string; branch?: string } | undefined;
  const resolvedCompanyName = useResolvedCompanyName(companyName, { scope: resolvedScope });
  const resolvedBranchName = useResolvedBranchName(rawUser?.branch, { scope: resolvedScope });
  const contextBranchName = useSidebarStore((state) => state.context.branchName);
  const assignedCompany = userItem?.company || rawUser?.company || resolvedCompanyName || '—';
  const assignedBranch =
    userItem?.branch ||
    rawUser?.branch ||
    (resolvedBranchName && !isFallbackEntityName(resolvedBranchName)
      ? resolvedBranchName
      : undefined) ||
    (contextBranchName && !isFallbackEntityName(contextBranchName)
      ? contextBranchName
      : undefined) ||
    '—';

  const baseRoute = getUsersAndRolesBaseRoute(pathname, resolvedScope);

  const userRoleScope = staffProfile.matchedRole?.scope || staffProfile.userItem?.scope;
  const isEditDisabled = isUserEditDisabled(userRoleScope, resolvedScope);

  const [mode, setMode] = useState<'view' | 'edit'>(() => {
    if (isEditDisabled) return 'view';
    return initialMode;
  });

  const isReadOnly = isEditDisabled || mode === 'view';
  const remoteCategories = staffProfile.categories;
  const isPermissionsLoading = staffProfile.isPermissionsLoading;
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [appliedRemoteCategories, setAppliedRemoteCategories] = useState<
    PermissionCategory[] | null
  >(null);

  // Sync remote permission matrix into editable local state when the query result changes.
  if (remoteCategories.length > 0 && remoteCategories !== appliedRemoteCategories) {
    setAppliedRemoteCategories(remoteCategories);
    setCategories(remoteCategories);
  }

  const displayCategories = categories.length > 0 ? categories : remoteCategories;

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

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

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffProfileFormValues>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      countryCode: '+1',
      username: '',
      password: '',
      userStatus: true,
      roleName: '',
      roleDescription: '',
    },
    values: userProfile ?? undefined,
    resetOptions: { keepDirtyValues: true },
  });

  const userStatusValue = useWatch({ control, name: 'userStatus' });
  const countryCodeValue = useWatch({ control, name: 'countryCode' });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(baseRoute);
    }
  };

  const handleTogglePermission = (categoryId: string, permissionId: string) => {
    if (isReadOnly) return;
    setCategories((prev) => togglePermissionCategory(prev, categoryId, permissionId));
  };

  const handleToggleCategoryAll = (categoryId: string, enableAll: boolean) => {
    if (isReadOnly) return;
    setCategories((prev) => toggleAllInCategory(prev, categoryId, enableAll));
  };

  const handleSendResetPassword = () => {
    showToast(`Password reset link sent to ${userProfile?.email ?? 'user'}`, 'info');
  };

  const handleResendInvitation = () => {
    showToast(`Invitation email resent to ${userProfile?.email ?? 'user'}`, 'success');
  };

  const handleConfirmDeactivation = async () => {
    setIsDeactivating(true);
    try {
      await staffProfile.deactivate();
      setIsDeactivateModalOpen(false);
      setValue('userStatus', false);
      showToast('User has been inactivated.', 'warning');
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleConfirmActivation = async () => {
    setIsActivating(true);
    try {
      await staffProfile.activate();
      setIsActivateModalOpen(false);
      setValue('userStatus', true);
      showToast('User has been activated successfully!', 'success');
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    } finally {
      setIsActivating(false);
    }
  };

  const onSubmit = async (data: StaffProfileFormValues) => {
    try {
      await staffProfile.saveProfile({ values: data, categories });
      onSave?.(data, categories);
      setMode('view');
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    }
  };

  const handleToggleActivate = () => {
    if (userStatusValue) {
      setIsDeactivateModalOpen(true);
    } else {
      setIsActivateModalOpen(true);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        pb: 4,
      }}
    >
      <StaffProfileHeader
        isReadOnly={isReadOnly}
        isEditDisabled={isEditDisabled}
        onBack={handleBack}
        onEnterEditMode={() => setMode('edit')}
        onNavigateHome={() => router.push(baseRoute)}
      />

      {staffProfile.isError ? (
        <AlertMessage
          variant="error"
          message={staffProfile.error?.message || 'Error loading user'}
        />
      ) : staffProfile.isLoading || !userProfile ? (
        <Loading message="Loading staff member profile..." />
      ) : (
        <Card
          variant="outlined"
          padding={3}
          sx={{
            borderRadius: '16px',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            boxShadow: 'none',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} id="staff-profile-form" noValidate>
            <StaffProfileBasicInfoSection
              control={control}
              errors={errors}
              isReadOnly={isReadOnly}
              countryCode={countryCodeValue || '+91'}
              assignedCompany={assignedCompany}
              assignedBranch={assignedBranch}
              onCountryCodeChange={(code) => setValue('countryCode', code)}
              onSendResetPassword={handleSendResetPassword}
              onResendInvitation={handleResendInvitation}
            />

            <StaffProfileAccountStatusCard
              userStatusValue={Boolean(userStatusValue)}
              isReadOnly={isReadOnly}
              isEditDisabled={isEditDisabled}
              isDeactivating={isDeactivating}
              isActivating={isActivating}
              onToggleActivate={handleToggleActivate}
            />

            <StaffProfileRoleSection
              control={control}
              errors={errors}
              isReadOnly={isReadOnly}
              displayCategories={displayCategories}
              isPermissionsLoading={isPermissionsLoading}
              onTogglePermission={handleTogglePermission}
              onToggleCategoryAll={handleToggleCategoryAll}
            />
          </form>
        </Card>
      )}

      {!isReadOnly && (
        <StaffProfileFooter
          isSubmitting={isSubmitting}
          footerTarget={footerTarget}
          onCancel={() => setMode('view')}
        />
      )}

      {userProfile && (
        <StaffProfileStatusModals
          userName={`${userProfile.firstName} ${userProfile.lastName}`}
          isDeactivateModalOpen={isDeactivateModalOpen}
          isActivateModalOpen={isActivateModalOpen}
          isDeactivating={isDeactivating}
          isActivating={isActivating}
          onCloseDeactivate={() => setIsDeactivateModalOpen(false)}
          onCloseActivate={() => setIsActivateModalOpen(false)}
          onConfirmDeactivate={handleConfirmDeactivation}
          onConfirmActivate={handleConfirmActivation}
        />
      )}

      <Toast
        open={toastFeedback.open}
        message={toastFeedback.message}
        severity={toastFeedback.severity}
        onClose={() => setToastFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

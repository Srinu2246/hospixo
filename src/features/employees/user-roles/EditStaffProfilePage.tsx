'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { Card } from '@/components/shared/ui/Card';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { MobileNumberInput } from '@/components/shared/form-fields/MobileNumberInput';
import { Modal } from '@/components/shared/ui/Modal';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { colors } from '@/lib/theme/mui/colors';

import {
  staffProfileSchema,
  type StaffProfileFormValues,
  type PermissionCategory,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { useStaffProfile } from '@/lib/hooks/employees/user-roles';
import { useUserRolesUiStore } from '@/stores/userRolesUiStore';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { PermissionGroupsGrid } from './components';

export interface EditStaffProfilePageProps {
  initialMode?: 'view' | 'edit';
  onBack?: () => void;
  onSave?: (values: StaffProfileFormValues, permissions: PermissionCategory[]) => void;
  scope?: ScopeType;
  companyName?: string;
}

/**
 * EditStaffProfilePage Component
 *
 * Page-level screen for inspecting and updating an employee's staff profile,
 * contact information, system role, and access rights.
 */
export function EditStaffProfilePage({
  initialMode = 'edit',
  onBack,
  onSave,
  scope,
}: Readonly<EditStaffProfilePageProps>) {
  const selectedUserId = useUserRolesUiStore((state) => state.selectedUserId);
  const staffProfile = useStaffProfile(selectedUserId);
  const userProfile = staffProfile.profile;
  const router = useRouter();
  const pathname = usePathname() || '';

  const resolvedScope: ScopeType =
    scope ||
    (pathname.includes('/company')
      ? 'company'
      : pathname.includes('/branch')
        ? 'branch'
        : 'organization');

  const getBaseRoute = () => {
    const stripped = pathname.replace(/\/(edit|profile)$/, '');
    if (stripped) return stripped;
    if (resolvedScope === 'company') return '/company/employees/users-and-roles';
    if (resolvedScope === 'branch') return '/branch-manager/employees/users-and-roles';
    return '/organization/employees/users-and-roles';
  };
  const baseRoute = getBaseRoute();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);

  useEffect(() => {
    if (staffProfile.categories.length > 0) {
      setCategories(staffProfile.categories);
    }
  }, [staffProfile.categories]);

  // Deactivation confirmation modal state
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Sticky footer portal container
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setFooterTarget(document.getElementById('app-shell-footer'));
  }, []);

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

  // React Hook Form with Zod validation
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
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
  });

  useEffect(() => {
    if (userProfile) {
      reset(userProfile);
    }
  }, [userProfile, reset]);

  const userStatusValue = watch('userStatus');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(baseRoute);
    }
  };

  // Permission toggles
  const handleTogglePermission = (categoryId: string, permissionId: string) => {
    if (mode === 'view') return;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          permissions: cat.permissions.map((p) =>
            p.id === permissionId ? { ...p, enabled: !p.enabled } : p,
          ),
        };
      }),
    );
  };

  const handleToggleCategoryAll = (categoryId: string, enableAll: boolean) => {
    if (mode === 'view') return;
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          permissions: cat.permissions.map((p) => ({ ...p, enabled: enableAll })),
        };
      }),
    );
  };

  // Reset password / send password reset email handler
  const handleSendResetPassword = () => {
    showToast(`Password reset link sent to ${userProfile?.email ?? 'user'}`, 'info');
  };

  // Resend invitation email handler
  const handleResendInvitation = () => {
    showToast(`Invitation email resent to ${userProfile?.email ?? 'user'}`, 'success');
  };

  // Confirm deactivation
  const handleConfirmDeactivation = async () => {
    setIsDeactivating(true);
    try {
      await staffProfile.deactivate();
      setIsDeactivateModalOpen(false);
      setValue('userStatus', false);
      showToast('User has been deactivated.', 'warning');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to deactivate user.', 'error');
    } finally {
      setIsDeactivating(false);
    }
  };

  const onSubmit = async (data: StaffProfileFormValues) => {
    try {
      await staffProfile.saveProfile({ values: data, categories });
      onSave?.(data, categories);
      showToast('Staff profile and permissions updated successfully!', 'success');
      setMode('view');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save profile.', 'error');
    }
  };

  const isReadOnly = mode === 'view';

  if (!selectedUserId) {
    return (
      <AlertMessage
        variant="warning"
        message="Select a user from Users & Roles to edit their profile."
      />
    );
  }

  if (staffProfile.isLoading) {
    return <Loading message="Loading staff profile…" />;
  }

  if (staffProfile.isError || !userProfile) {
    return <AlertMessage variant="error" message="Unable to load staff profile." />;
  }

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
      {/* Top Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Users & Roles', onClick: handleBack },
          { label: isReadOnly ? 'Staff Profile' : 'Edit Staff Profile', active: true },
        ]}
      />

      {/* Header with Title and Mode Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            aria-label="Back to users"
            sx={{
              p: 0.75,
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              borderRadius: '8px',
              color: 'text.primary',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
              },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              {isReadOnly ? 'Staff Profile' : 'Edit Staff Profile'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mt: 0.25, fontSize: '0.875rem' }}
            >
              {isReadOnly
                ? 'Review user account, permissions, and security settings.'
                : 'Update user account, assign permissions, and change user roles.'}
            </Typography>
          </Box>
        </Box>

        {isReadOnly ? (
          <ActionButton
            variant="primary"
            startIcon={<EditOutlinedIcon fontSize="small" />}
            onClick={() => setMode('edit')}
          >
            Edit Profile
          </ActionButton>
        ) : (
          <ActionButton variant="outlined" onClick={() => setMode('view')}>
            View Only
          </ActionButton>
        )}
      </Box>

      {/* Main Content Card */}
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
        <form onSubmit={handleSubmit(onSubmit)} id="staff-profile-form">
          {/* SECTION 1: Personal & Account Information */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Personal & Account Information
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, mt: 0.25, fontSize: '0.8125rem' }}
              >
                Basic contact credentials and system access identity.
              </Typography>
            </Box>

            {/* Name Row: First Name & Last Name */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="FIRST NAME"
                    required
                    placeholder="Enter first name"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="LAST NAME"
                    required
                    placeholder="Enter last name"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Email & Phone */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    label="EMAIL ADDRESS"
                    required
                    type="email"
                    placeholder="name@company.com"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <MobileNumberInput
                    label="PHONE NUMBER"
                    required
                    countryCode={watch('countryCode') || '+91'}
                    onCountryCodeChange={(code) => setValue('countryCode', code)}
                    placeholder="98765 43210"
                    phoneNumber={field.value}
                    onPhoneNumberChange={field.onChange}
                    disabled={isReadOnly}
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Box>

            {/* Username & Password / Reset Section */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    label="USERNAME"
                    required
                    placeholder="e.g. john.doe"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    error={Boolean(errors.username)}
                    helperText={errors.username?.message}
                    fullWidth
                  />
                )}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                  }}
                >
                  Password & Security
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <ActionButton
                    variant="outlined"
                    size="small"
                    startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleSendResetPassword}
                    sx={{ flex: 1, height: 42 }}
                  >
                    Reset Password
                  </ActionButton>
                  <ActionButton
                    variant="outlined"
                    size="small"
                    startIcon={<MailOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={handleResendInvitation}
                    sx={{ flex: 1, height: 42 }}
                  >
                    Resend Invite
                  </ActionButton>
                </Box>
              </Box>
            </Box>

            {/* User Active / Inactive Status Toggle */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? colors.surface.darkMuted
                    : 'rgba(249, 250, 251, 0.75)',
                mt: 1,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'text.primary',
                  }}
                >
                  Active Account Status
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary, fontSize: '0.8125rem', mt: 0.25 }}
                >
                  {userStatusValue
                    ? 'Account is enabled. Staff member can log in and perform assigned duties.'
                    : 'Account is currently disabled. Login access is blocked.'}
                </Typography>
              </Box>

              <Switch
                checked={userStatusValue}
                disabled={isReadOnly}
                onChange={(e) => setValue('userStatus', e.target.checked)}
                color="primary"
              />
            </Box>
          </Box>

          {/* SECTION 2: Role & Permissions Assignment */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 4 }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Role & Permissions Assignment
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, mt: 0.25, fontSize: '0.8125rem' }}
              >
                Assign specific authorization scopes and granular operational permissions.
              </Typography>
            </Box>

            {/* Role Name & Description */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Controller
                name="roleName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="ROLE NAME"
                    required
                    placeholder="e.g. Branch Manager"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    error={Boolean(errors.roleName)}
                    helperText={errors.roleName?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="roleDescription"
                control={control}
                render={({ field }) => (
                  <Input
                    label="DESCRIPTION"
                    placeholder="e.g. Manages staff and inventory at a specific branch level."
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    error={Boolean(errors.roleDescription)}
                    helperText={errors.roleDescription?.message}
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* Permissions Subtitle */}
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'text.primary',
                mt: 1,
              }}
            >
              Permissions
            </Typography>

            {/* Reusable Permission Groups Grid */}
            <PermissionGroupsGrid
              categories={categories}
              onTogglePermission={handleTogglePermission}
              onToggleCategoryAll={handleToggleCategoryAll}
              readOnly={isReadOnly}
              badgeMode="enabled"
            />
          </Box>

          {/* SECTION 3: Danger Zone */}
          {!isReadOnly && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mt: 4,
              }}
            >
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: colors.danger.default,
                }}
              >
                Danger Zone
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  fontSize: '0.8125rem',
                  mt: -0.5,
                }}
              >
                Actions here are permanent and affect payroll and scheduling.
              </Typography>

              <Box sx={{ mt: 0.5 }}>
                <ActionButton
                  variant="outlined"
                  onClick={() => setIsDeactivateModalOpen(true)}
                  sx={{
                    color: colors.danger.default,
                    borderColor: colors.danger.default,
                    '&:hover': {
                      borderColor: colors.danger.dark,
                      bgcolor: 'rgba(239, 68, 68, 0.05)',
                    },
                  }}
                >
                  Deactivate Staff Member
                </ActionButton>
              </Box>
            </Box>
          )}
        </form>
      </Card>

      {/* STICKY FOOTER BAR */}
      {!isReadOnly &&
        (() => {
          const stickyFooterContent = (
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
                    ? '0 -4px 20px rgba(0, 0, 0, 0.4)'
                    : '0 -2px 12px rgba(0, 0, 0, 0.05)',
                px: { xs: 2.5, sm: 4 },
                py: 1.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1.5,
                boxSizing: 'border-box',
              }}
            >
              <ActionButton
                variant="outlined"
                onClick={() => setMode('view')}
                disabled={isSubmitting}
                sx={{
                  height: 38,
                  px: 2.5,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="primary"
                type="submit"
                form="staff-profile-form"
                loading={isSubmitting}
                sx={{
                  height: 38,
                  px: 2.5,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Save Changes
              </ActionButton>
            </Box>
          );

          if (footerTarget) {
            return createPortal(stickyFooterContent, footerTarget);
          }

          return (
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                zIndex: 20,
                mt: 'auto',
                pt: 2,
              }}
            >
              {stickyFooterContent}
            </Box>
          );
        })()}

      {/* Confirmation Modal for Staff Deactivation */}
      <Modal
        open={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        title="Deactivate Staff Member"
        subtitle={`Are you sure you want to deactivate ${userProfile.firstName} ${userProfile.lastName}?`}
        width={480}
        height="auto"
        padding={24}
        footer={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
            <ActionButton
              variant="outlined"
              onClick={() => setIsDeactivateModalOpen(false)}
              disabled={isDeactivating}
            >
              Cancel
            </ActionButton>
            <ActionButton
              variant="primary"
              loading={isDeactivating}
              onClick={handleConfirmDeactivation}
              sx={{
                bgcolor: colors.danger.default,
                '&:hover': { bgcolor: colors.danger.dark },
              }}
            >
              Confirm Deactivation
            </ActionButton>
          </Box>
        }
      >
        <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
          Deactivating this user will revoke their system access immediately. Their historical
          records and logs will remain preserved, but they will no longer be able to log in.
        </Typography>
      </Modal>

      {/* Reusable Toast Notification */}
      <Toast
        open={toastFeedback.open}
        message={toastFeedback.message}
        severity={toastFeedback.severity}
        onClose={() => setToastFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

// Re-export for backwards compatibility
export { EditStaffProfilePage as EditStaffProfileScreen };
export default EditStaffProfilePage;

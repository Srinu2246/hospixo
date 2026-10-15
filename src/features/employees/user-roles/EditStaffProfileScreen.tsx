'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';

import { staffProfileSchema, type StaffProfileFormValues } from '@/lib/schemas/user-roles';
import {
  DEFAULT_STAFF_PROFILE,
  DEFAULT_STAFF_PROFILE_PERMISSIONS,
} from '@/lib/mocks/employees/multiform.mocks';
import type { PermissionCategory, ScopeType } from '@/types/user-roles';
import { PermissionGroupsGrid } from '@/components/features/user-roles';

export interface EditStaffProfileScreenProps {
  initialMode?: 'view' | 'edit';
  userProfile?: typeof DEFAULT_STAFF_PROFILE;
  onBack?: () => void;
  onSave?: (values: StaffProfileFormValues, permissions: PermissionCategory[]) => void;
  scope?: ScopeType;
  companyName?: string;
}

export function EditStaffProfileScreen({
  initialMode = 'edit',
  userProfile = DEFAULT_STAFF_PROFILE,
  onBack,
  onSave,
  scope,
  companyName: _companyName = 'VJITVI',
}: Readonly<EditStaffProfileScreenProps>) {
  void _companyName;
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
    return pathname.startsWith('/users-and-roles')
      ? '/users-and-roles'
      : '/organization/employees/users-and-roles';
  };
  const baseRoute = getBaseRoute();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [categories, setCategories] = useState<PermissionCategory[]>(
    DEFAULT_STAFF_PROFILE_PERMISSIONS,
  );

  // Deactivation confirmation modal state
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const footerTarget = useAppShellFooterTarget();

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
    formState: { errors, isSubmitting },
  } = useForm<StaffProfileFormValues>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber,
      countryCode: userProfile.countryCode,
      username: userProfile.username,
      password: '',
      userStatus: userProfile.userStatus,
      roleName: userProfile.roleName,
      roleDescription: userProfile.roleDescription,
    },
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

  // Form Submission
  const onSubmit = (data: StaffProfileFormValues) => {
    if (onSave) {
      onSave(data, categories);
    }
    showToast('Staff profile and permissions updated successfully!', 'success');
    setTimeout(() => {
      setMode('view');
    }, 400);
  };

  // Deactivate Action
  const handleConfirmDeactivation = () => {
    setIsDeactivating(true);
    setTimeout(() => {
      setValue('userStatus', false);
      setIsDeactivating(false);
      setIsDeactivateModalOpen(false);
      showToast('Staff member has been deactivated.', 'warning');
    }, 600);
  };

  const isReadOnly = mode === 'view';
  const pageTitle = isReadOnly ? 'View Staff Profile' : 'Edit Staff Profile';

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
          { label: pageTitle, active: true },
        ]}
      />

      {/* Header with Back Arrow and Action Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            {pageTitle}
          </Typography>
        </Box>

        {isReadOnly && (
          <ActionButton
            variant="primary"
            startIcon={<EditOutlinedIcon fontSize="small" />}
            onClick={() => setMode('edit')}
          >
            Edit Staff Profile
          </ActionButton>
        )}
      </Box>

      {/* Main Content Card (Standard 24px padding via Card) */}
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
          {/* ============================================================== */}
          {/* SECTION 1: Personal Information                                */}
          {/* ============================================================== */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              Personal Information
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              {/* First Name */}
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="FIRST NAME"
                    required={!isReadOnly}
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

              {/* Last Name */}
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="LAST NAME"
                    required={!isReadOnly}
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

              {/* Email Address */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    label="EMAIL ADDRESS"
                    required={!isReadOnly}
                    type="email"
                    placeholder="e.g. marco@email.com"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    startIcon={
                      <MailOutlineOutlinedIcon
                        sx={{ fontSize: 18, color: colors.text.secondary }}
                      />
                    }
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    fullWidth
                  />
                )}
              />

              {/* Phone Number (Reusing MobileNumberInput) */}
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <MobileNumberInput
                    label="PHONE NUMBER"
                    required={!isReadOnly}
                    placeholder="(555) 123-4567"
                    phoneNumber={field.value}
                    onPhoneNumberChange={field.onChange}
                    countryCode={countryCodeValue}
                    onCountryCodeChange={(code) => setValue('countryCode', code)}
                    disabled={isReadOnly}
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />

              {/* Username */}
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    label="USERNAME"
                    required={!isReadOnly}
                    placeholder="Enter username"
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

              {/* Password */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label="PASSWORD"
                    type="password"
                    placeholder={isReadOnly ? '••••••••' : 'Enter new password or leave blank'}
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isReadOnly}
                    startIcon={
                      <LockOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
                    }
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                    fullWidth
                  />
                )}
              />
            </Box>

            {/* User Status Toggle */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>
                User Status
              </Typography>
              <Switch
                checked={Boolean(userStatusValue)}
                disabled={isReadOnly}
                onChange={(e) => setValue('userStatus', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: colors.primary.default,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: colors.primary.default,
                  },
                }}
              />
            </Box>
          </Box>

          {/* ============================================================== */}
          {/* SECTION 2: Configure Permissions                               */}
          {/* ============================================================== */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              Configure Permissions
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              {/* Role Name */}
              <Controller
                name="roleName"
                control={control}
                render={({ field }) => (
                  <Input
                    label="ROLE NAME"
                    required={!isReadOnly}
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

              {/* Role Description */}
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

            {/* Reusable Permission Groups 2-Column Grid */}
            <PermissionGroupsGrid
              categories={categories}
              onTogglePermission={handleTogglePermission}
              onToggleCategoryAll={handleToggleCategoryAll}
              readOnly={isReadOnly}
              badgeMode="enabled"
            />
          </Box>

          {/* ============================================================== */}
          {/* SECTION 3: Danger Zone                                         */}
          {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* STICKY FOOTER BAR (Stuck to bottom of viewport)                */}
      {/* ============================================================== */}
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

'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { Card } from '@/components/shared/ui/Card';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { colors } from '@/lib/theme/mui/colors';

import {
  customTemplateSchema,
  type CustomTemplateFormValues,
  type PermissionCategory,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { useCreateCustomRole, useGroupedPermissions } from '@/lib/hooks/employees/user-roles';
import { PermissionGroupsGrid } from '@/components/features/user-roles';

export interface CreateCustomTemplateScreenProps {
  onBack?: () => void;
  onSaveTemplate?: (values: CustomTemplateFormValues, permissions: PermissionCategory[]) => void;
  scope?: ScopeType;
  companyName?: string;
}

interface PresetOption {
  id: CustomTemplateFormValues['preset'];
  title: string;
  description: string;
}

const PRESET_OPTIONS: readonly PresetOption[] = [
  {
    id: 'full_read',
    title: 'Full Read Access',
    description: 'View all standard modules and reports.',
  },
  {
    id: 'standard_manager',
    title: 'Standard Manager',
    description: 'Balanced permissions for store tasks.',
  },
  {
    id: 'view_only',
    title: 'View Only',
    description: 'Restricted purely to operations.',
  },
  {
    id: 'custom',
    title: 'Custom Setup',
    description: 'Manually set permissions in the next step.',
  },
];

/**
 * CreateCustomTemplatePage Component
 *
 * Page-level screen for authoring new role templates with preset permissions.
 */
export function CreateCustomTemplateScreen({
  onBack,
  onSaveTemplate,
  scope,
}: Readonly<CreateCustomTemplateScreenProps>) {
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
    const stripped = pathname.replace(/\/custom-template$/, '');
    if (stripped) return stripped;
    if (resolvedScope === 'company') return '/company/employees/users-and-roles';
    if (resolvedScope === 'branch') return '/branch-manager/employees/users-and-roles';
    return '/organization/employees/users-and-roles';
  };
  const baseRoute = getBaseRoute();

  // Template permissions state
  const groupedPermissions = useGroupedPermissions();
  const createCustomRole = useCreateCustomRole();
  const remoteCategories = groupedPermissions.data ?? [];
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [syncedRemoteCategories, setSyncedRemoteCategories] =
    useState<PermissionCategory[]>(remoteCategories);

  if (remoteCategories !== syncedRemoteCategories) {
    setSyncedRemoteCategories(remoteCategories);
    if (remoteCategories.length > 0) {
      setCategories(remoteCategories);
    }
  }

  const footerTarget = useAppShellFooterTarget();

  const [toastFeedback, setToastFeedback] = useState<{
    open: boolean;
    message: string;
    severity: ToastSeverity;
  }>({
    open: false,
    message: '',
    severity: 'warning',
  });

  // Form Management
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomTemplateFormValues>({
    resolver: zodResolver(customTemplateSchema),
    defaultValues: {
      templateName: 'Custom role',
      description:
        'Assigned to custom restaurant/branch supervisors with partial finance approval limits.',
      preset: 'custom',
    },
  });

  const selectedPreset = useWatch({ control, name: 'preset' });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push(`${baseRoute}/template`);
    }
  };

  // Switch preset and configure baseline permissions accordingly
  const handleSelectPreset = (presetId: CustomTemplateFormValues['preset']) => {
    setValue('preset', presetId);

    if (presetId === 'full_read') {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          permissions: cat.permissions.map((p) => ({
            ...p,
            enabled: p.id.includes('view') || p.name.toLowerCase().includes('view'),
          })),
        })),
      );
    } else if (presetId === 'standard_manager') {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          permissions: cat.permissions.map((p) => ({
            ...p,
            enabled: !p.id.includes('refund') && !p.id.includes('drawer'),
          })),
        })),
      );
    } else if (presetId === 'view_only') {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          permissions: cat.permissions.map((p) => ({
            ...p,
            enabled: p.id.includes('view') || p.id.includes('sales'),
          })),
        })),
      );
    }
  };

  // Toggle individual permission
  const handleTogglePermission = (categoryId: string, permissionId: string) => {
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

  // Toggle all permissions in a category
  const handleToggleCategoryAll = (categoryId: string, enableAll: boolean) => {
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
  const onSubmit = async (data: CustomTemplateFormValues) => {
    const hasAtLeastOnePermission = categories.some((cat) =>
      cat.permissions.some((p) => p.enabled),
    );
    if (!hasAtLeastOnePermission) {
      setToastFeedback({
        open: true,
        message: 'Please enable at least one permission for this role template.',
        severity: 'warning',
      });
      return;
    }
    try {
      await createCustomRole.mutateAsync({ values: data, categories });
      onSaveTemplate?.(data, categories);
      handleBack();
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
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
      {/* Top Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Users & Roles', onClick: handleBack },
          { label: 'Create Custom Template', active: true },
        ]}
      />

      {/* Header with Title and Subtitle */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <IconButton
          onClick={handleBack}
          size="small"
          aria-label="Back to users"
          sx={{
            mt: 0.25,
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
            Create Custom Template
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.text.secondary, mt: 0.5, fontSize: '0.875rem' }}
          >
            Define a brand new role template from scratch with custom parameters.
          </Typography>
        </Box>
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
        <form onSubmit={handleSubmit(onSubmit)} id="custom-template-form" noValidate>
          {/* SECTION 1: Template Information */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Controller
              name="templateName"
              control={control}
              render={({ field }) => (
                <Input
                  label="TEMPLATE NAME"
                  required
                  placeholder="Enter template name"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={Boolean(errors.templateName)}
                  helperText={errors.templateName?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  label="DESCRIPTION"
                  placeholder="Enter role template description"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                  fullWidth
                />
              )}
            />
          </Box>

          {/* SECTION 2: Configure Permissions & Presets */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
            <Box>
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
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, mt: 0.25, fontSize: '0.8125rem' }}
              >
                Set module access and actions for this role template. Toggles save automatically.
              </Typography>
            </Box>

            {/* 4 Preset Option Cards */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
                gap: 2,
                mt: 0.5,
              }}
            >
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = selectedPreset === opt.id;
                return (
                  <Box
                    key={opt.id}
                    onClick={() => handleSelectPreset(opt.id)}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: isSelected
                        ? colors.primary.default
                        : (theme) =>
                            theme.palette.mode === 'dark'
                              ? theme.palette.divider
                              : colors.border.default,
                      bgcolor: isSelected
                        ? (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(25, 118, 210, 0.12)'
                              : 'rgba(25, 118, 210, 0.04)'
                        : (theme) =>
                            theme.palette.mode === 'dark'
                              ? colors.surface.darkMuted
                              : colors.surface.default,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      '&:hover': {
                        borderColor: isSelected ? colors.primary.default : colors.primary.light,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'text.primary',
                        }}
                      >
                        {opt.title}
                      </Typography>
                      {isSelected ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: colors.primary.default }} />
                      ) : (
                        <RadioButtonUncheckedIcon
                          sx={{ fontSize: 20, color: colors.text.secondary }}
                        />
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        color: colors.text.secondary,
                        lineHeight: 1.4,
                      }}
                    >
                      {opt.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'text.primary',
                mt: 2,
              }}
            >
              Permissions
            </Typography>

            {/* Reusable Permission Groups Grid */}
            <PermissionGroupsGrid
              categories={categories}
              onTogglePermission={handleTogglePermission}
              onToggleCategoryAll={handleToggleCategoryAll}
              badgeMode="enabled"
            />
          </Box>
        </form>
      </Card>

      {/* STICKY FOOTER BAR */}
      {(() => {
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
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <ActionButton
              variant="outlined"
              onClick={handleBack}
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
              form="custom-template-form"
              loading={isSubmitting}
              sx={{
                height: 38,
                px: 2.5,
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Save Template
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

      <Toast
        open={toastFeedback.open}
        message={toastFeedback.message}
        severity={toastFeedback.severity}
        onClose={() => setToastFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

// Re-export for full backwards compatibility

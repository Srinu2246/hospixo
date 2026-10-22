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

import { Card } from '@/components/shared/ui/Card';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Input } from '@/components/shared/form-fields/Input';
import { Loading } from '@/components/shared/ui/Loading';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';

import {
  customTemplateSchema,
  resolveScopeFromPathname,
  getUsersAndRolesBaseRoute,
  type CustomTemplateFormValues,
  type PermissionCategory,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  togglePermissionCategory,
  toggleAllInCategory,
} from '@/lib/helpers/employees/userRolesHelpers';
import { useCreateCustomRole, useGroupedPermissions } from '@/lib/hooks/employees/user-roles';
import { PermissionGroupsGrid } from '@/components/features/user-roles';
import { CustomTemplatePresetCards } from '@/components/features/user-roles/custom-template/CustomTemplatePresetCards';
import { CustomTemplateFooter } from '@/components/features/user-roles/custom-template/CustomTemplateFooter';

export interface CreateCustomTemplateScreenProps {
  onBack?: () => void;
  onSaveTemplate?: (values: CustomTemplateFormValues, permissions: PermissionCategory[]) => void;
  scope?: ScopeType;
  companyName?: string;
}

export function CreateCustomTemplateScreen({
  onBack,
  onSaveTemplate,
  scope,
}: Readonly<CreateCustomTemplateScreenProps>) {
  const router = useRouter();
  const pathname = usePathname() || '';

  const resolvedScope = resolveScopeFromPathname(pathname, scope);
  const baseRoute = getUsersAndRolesBaseRoute(pathname, resolvedScope);

  const groupedPermissions = useGroupedPermissions();
  const createCustomRole = useCreateCustomRole();
  const remoteCategories = groupedPermissions.data;
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [syncedRemoteCategories, setSyncedRemoteCategories] = useState<
    PermissionCategory[] | undefined
  >(undefined);

  // Sync draft permissions when remote categories first load / change (render-time adjust).
  if (remoteCategories?.length && remoteCategories !== syncedRemoteCategories) {
    setSyncedRemoteCategories(remoteCategories);
    setCategories(remoteCategories);
  }

  const footerTarget = useAppShellFooterTarget();

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

  const handleTogglePermission = (categoryId: string, permissionId: string) => {
    setCategories((prev) => togglePermissionCategory(prev, categoryId, permissionId));
  };

  const handleToggleCategoryAll = (categoryId: string, enableAll: boolean) => {
    setCategories((prev) => toggleAllInCategory(prev, categoryId, enableAll));
  };

  const onSubmit = async (data: CustomTemplateFormValues) => {
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
      <Box
        sx={{
          mt: { [screen.mobile]: -2, [screen.desktop]: -3 },
          mx: { [screen.mobile]: -2, [screen.desktop]: -3 },
          px: { [screen.mobile]: 2, [screen.desktop]: 3 },
          py: 1.5,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
          borderBottom: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          mb: 0.5,
        }}
      >
        <Breadcrumbs
          items={[
            { label: 'Users & Roles', onClick: () => router.push(baseRoute) },
            { label: 'Template', onClick: handleBack },
            { label: 'Create Role', active: true },
          ]}
          activeSx={{ color: colors.primary.default, fontWeight: 600 }}
        />
      </Box>

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
        <form onSubmit={handleSubmit(onSubmit)} id="custom-template-form">
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

            <CustomTemplatePresetCards
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
            />

            <Box sx={{ mt: 2 }}>
              {groupedPermissions.isLoading ? (
                <Loading message="Loading permissions catalog..." />
              ) : groupedPermissions.isError ? (
                <AlertMessage
                  variant="error"
                  message="Failed to load permissions catalog. You can still create the role template."
                />
              ) : (
                <PermissionGroupsGrid
                  categories={categories}
                  onTogglePermission={handleTogglePermission}
                  onToggleCategoryAll={handleToggleCategoryAll}
                  showEnabledOnly={false}
                />
              )}
            </Box>
          </Box>
        </form>
      </Card>

      <CustomTemplateFooter
        isSubmitting={isSubmitting}
        footerTarget={footerTarget}
        onCancel={handleBack}
      />
    </Box>
  );
}

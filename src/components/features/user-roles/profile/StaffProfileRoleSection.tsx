'use client';

import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Input } from '@/components/shared/form-fields/Input';
import { colors } from '@/lib/theme/mui/colors';
import { PermissionGroupsGrid } from '@/components/features/user-roles';
import { Loading } from '@/components/shared/ui/Loading';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import type {
  StaffProfileFormValues,
  PermissionCategory,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface StaffProfileRoleSectionProps {
  control: Control<StaffProfileFormValues>;
  errors: FieldErrors<StaffProfileFormValues>;
  isReadOnly: boolean;
  displayCategories: PermissionCategory[];
  isPermissionsLoading?: boolean;
  onTogglePermission: (categoryId: string, permissionId: string) => void;
  onToggleCategoryAll: (categoryId: string, enableAll: boolean) => void;
}

export function StaffProfileRoleSection({
  control,
  errors,
  isReadOnly,
  displayCategories,
  isPermissionsLoading = false,
  onTogglePermission,
  onToggleCategoryAll,
}: Readonly<StaffProfileRoleSectionProps>) {
  return (
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

      <Box sx={{ mt: 1 }}>
        {isPermissionsLoading ? (
          <Loading />
        ) : displayCategories.length === 0 ? (
          <AlertMessage variant="info" message="No permissions are assigned to this role." />
        ) : (
          <PermissionGroupsGrid
            categories={displayCategories}
            onTogglePermission={onTogglePermission}
            onToggleCategoryAll={onToggleCategoryAll}
            readOnly={true}
            showEnabledOnly
          />
        )}
      </Box>
    </Box>
  );
}

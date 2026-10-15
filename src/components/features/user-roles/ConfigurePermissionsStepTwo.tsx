'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { Input } from '@/components/shared/form-fields/Input';
import { colors } from '@/lib/theme/mui/colors';
import type { PermissionCategory } from '@/types/user-roles';
import { PermissionGroupsGrid } from './PermissionGroupsGrid';

export interface ConfigurePermissionsStepTwoProps {
  categories: PermissionCategory[];
  onTogglePermission: (categoryId: string, permissionId: string) => void;
  onToggleCategoryAll: (categoryId: string, enableAll: boolean) => void;
  roleName?: string;
  roleDescription?: string;
  onRoleNameChange?: (name: string) => void;
  onRoleDescriptionChange?: (desc: string) => void;
}

export function ConfigurePermissionsStepTwo({
  categories,
  onTogglePermission,
  onToggleCategoryAll,
  roleName = 'Branch Manager',
  roleDescription = 'Manages staff and inventory at a specific branch level.',
  onRoleNameChange,
  onRoleDescriptionChange,
}: Readonly<ConfigurePermissionsStepTwoProps>) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* Configure Permissions Main Card (24px padding via shared Card) */}
      <Card
        variant="outlined"
        padding={3}
        sx={{
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          boxShadow: 'none',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.375rem' },
            color: 'text.primary',
          }}
        >
          Configure Permissions
        </Typography>

        {/* Role Name and Description Input Fields matching Screenshot */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            columnGap: { xs: 2, md: 4 },
            rowGap: 2.5,
          }}
        >
          <Input
            label="ROLE NAME"
            value={roleName}
            onChange={(e) => onRoleNameChange?.(e.target.value)}
            placeholder="e.g. Branch Manager"
            fullWidth
          />
          <Input
            label="DESCRIPTION"
            value={roleDescription}
            onChange={(e) => onRoleDescriptionChange?.(e.target.value)}
            placeholder="e.g. Manages staff and inventory at a specific branch level."
            fullWidth
          />
        </Box>

        {/* Section Heading: Permissions */}
        <Box sx={{ mt: 0.5 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            Permissions
          </Typography>

          {/* 2-Column Responsive Permission Groups */}
          <PermissionGroupsGrid
            categories={categories}
            onTogglePermission={onTogglePermission}
            onToggleCategoryAll={onToggleCategoryAll}
            badgeMode="enabled"
            maxHeight={{ xs: 480, md: 'calc(100vh - 360px)' }}
          />
        </Box>
      </Card>
    </Box>
  );
}

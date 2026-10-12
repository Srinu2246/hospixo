'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type { PermissionCategory } from '../../types/multiform.types';
import { PermissionGroupsGrid } from '../common/PermissionGroupsGrid';

export interface ConfigurePermissionsStepTwoProps {
  categories: PermissionCategory[];
  onTogglePermission: (categoryId: string, permissionId: string) => void;
  onToggleCategoryAll: (categoryId: string, enableAll: boolean) => void;
}

export function ConfigurePermissionsStepTwo({
  categories,
  onTogglePermission,
  onToggleCategoryAll,
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
          gap: 2,
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

        {/* 2-Column Responsive Permission Groups */}
        <PermissionGroupsGrid
          categories={categories}
          onTogglePermission={onTogglePermission}
          onToggleCategoryAll={onToggleCategoryAll}
          badgeMode="disabled"
          maxHeight={{ xs: 480, md: 'calc(100vh - 360px)' }}
        />
      </Card>
    </Box>
  );
}

export default ConfigurePermissionsStepTwo;

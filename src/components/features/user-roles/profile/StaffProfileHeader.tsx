'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import { userRolesBreadcrumbStripSx } from '@/lib/helpers/employees/userRolesLayout';

export interface StaffProfileHeaderProps {
  isReadOnly: boolean;
  isEditDisabled: boolean;
  /** Role name for titles, e.g. "Branch Admin Profile". */
  roleLabel?: string;
  onBack: () => void;
  onEnterEditMode: () => void;
  onNavigateHome: () => void;
}

export function StaffProfileHeader({
  isReadOnly,
  isEditDisabled,
  roleLabel = 'Staff',
  onBack,
  onEnterEditMode,
  onNavigateHome,
}: Readonly<StaffProfileHeaderProps>) {
  const profileTitle = isReadOnly ? `${roleLabel} Profile` : `Edit ${roleLabel} Profile`;
  return (
    <>
      {/* Top Breadcrumb Bar */}
      <Box
        sx={{
          ...userRolesBreadcrumbStripSx,
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
            { label: 'Users & Roles', onClick: onNavigateHome },
            {
              label: profileTitle,
              active: true,
            },
          ]}
          activeSx={{ color: colors.primary.default, fontWeight: 600 }}
        />
      </Box>

      {/* Screen Title & Action */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            onClick={onBack}
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
              {profileTitle}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.text.secondary, mt: 0.5, fontSize: '0.875rem' }}
            >
              {isReadOnly
                ? 'Review team member credentials, status, and assigned permissions.'
                : 'Update user account information and granular system access rights.'}
            </Typography>
          </Box>
        </Box>

        {isReadOnly && !isEditDisabled && (
          <ActionButton
            variant="primary"
            startIcon={<EditOutlinedIcon fontSize="small" />}
            onClick={onEnterEditMode}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Edit Profile
          </ActionButton>
        )}
      </Box>
    </>
  );
}

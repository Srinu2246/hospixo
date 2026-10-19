'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type {
  CreateUserFormValues,
  PermissionCategory,
  RoleTemplateItem,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { PermissionGroupsGrid } from './PermissionGroupsGrid';

export interface ReviewAndSaveStepThreeProps {
  formValues: CreateUserFormValues;
  selectedTemplate: RoleTemplateItem | null;
  categories: PermissionCategory[];
  onEditSection: (step: 'template' | 'user-form' | 'permissions') => void;
}

export function ReviewAndSaveStepThree({
  formValues,
  selectedTemplate,
  categories,
  onEditSection,
}: Readonly<ReviewAndSaveStepThreeProps>) {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
      {/* 1. Role Summary Card (24px padding) */}
      <Card
        variant="outlined"
        padding={3}
        sx={{
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Role Summary
          </Typography>
          <IconButton
            size="small"
            aria-label="Edit role summary"
            onClick={() => onEditSection('template')}
            sx={{
              color: colors.primary.default,
              '&:hover': { bgcolor: 'rgba(51, 84, 244, 0.08)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 2fr 1fr' },
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              ROLE NAME
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.role || 'Branch Admin'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              DESCRIPTION
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.45,
              }}
            >
              {selectedTemplate?.description ||
                'Manages staff and inventory at a specific branch level.'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 700,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              TEMPLATE
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {selectedTemplate?.title || formValues.role || 'Branch Admin'}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 2. User Information Card (Fixed Alignment, Clear Hierarchy, Zero Overlap) */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            User Information
          </Typography>
          <IconButton
            size="small"
            aria-label="Edit user information"
            onClick={() => onEditSection('user-form')}
            sx={{
              color: colors.primary.default,
              '&:hover': { bgcolor: 'rgba(51, 84, 244, 0.08)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 2-Column Clean Key-Value Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 4,
            rowGap: 2,
          }}
        >
          {/* First Name */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              First Name
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.firstName || 'Sarah'}
            </Typography>
          </Box>

          {/* Last Name */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Last Name
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.lastName || 'Chen'}
            </Typography>
          </Box>

          {/* Email Address */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Email Address
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.email || 'sarah.chen@example.com'}
            </Typography>
          </Box>

          {/* Phone Number */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Phone Number
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.phoneNumber || '+1 (555) 000-0000'}
            </Typography>
          </Box>

          {/* Username */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Username
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.username || 'sarahH123'}
            </Typography>
          </Box>

          {/* Password */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Password
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.password ? '••••••••' : 'sarahH@123'}
            </Typography>
          </Box>

          {/* Company */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Company
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.company || '—'}
            </Typography>
          </Box>

          {/* Branch */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Branch
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.branch || '—'}
            </Typography>
          </Box>

          {/* Role */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Role
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {formValues.role || 'Captain'}
            </Typography>
          </Box>
        </Box>

        {/* Invitation Status & Personal Message */}
        <Box
          sx={{
            pt: 2,
            borderTop: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              Send invitation email immediately
            </Typography>
            <Typography
              sx={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.success.default }}
            >
              Enabled
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}>
              Personal Message
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.5 }}>
              {formValues.personalMessage || 'Welcome to the team! Here is your access to Hospixo.'}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* 3. Permissions summary (same groups as configure step, read-only) */}
      <Card
        variant="outlined"
        padding={3}
        sx={{
          borderRadius: '12px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Permissions
          </Typography>
          <IconButton
            size="small"
            aria-label="Edit permissions"
            onClick={() => onEditSection('permissions')}
            sx={{
              color: colors.primary.default,
              '&:hover': { bgcolor: 'rgba(51, 84, 244, 0.08)' },
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        {categories.length === 0 ? (
          <Typography sx={{ fontSize: '0.875rem', color: colors.text.secondary }}>
            No permissions loaded. Go back to configure permissions.
          </Typography>
        ) : (
          <PermissionGroupsGrid categories={categories} readOnly badgeMode="enabled" />
        )}
      </Card>
    </Box>
  );
}

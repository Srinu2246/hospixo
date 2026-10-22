'use client';

import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { colors } from '@/lib/theme/mui/colors';
import type {
  CreateUserFormValues,
  ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface CreateUserAssignmentSectionProps {
  control: Control<CreateUserFormValues>;
  currentScope: ScopeType;
  companyOptions: string[];
  branchOptions: string[];
  roleOptions: string[];
  lockedCompanyLabel: string;
  lockedBranchLabel: string;
  isBranchLoading: boolean;
  onFieldChange: (field: keyof CreateUserFormValues, value: string | boolean) => void;
}

export function CreateUserAssignmentSection({
  control,
  currentScope,
  companyOptions,
  branchOptions,
  roleOptions,
  lockedCompanyLabel,
  lockedBranchLabel,
  isBranchLoading,
  onFieldChange,
}: Readonly<CreateUserAssignmentSectionProps>) {
  if (currentScope === 'branch') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: { xs: 2, md: 4 },
          rowGap: 3,
        }}
      >
        {/* Assign Company */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Assign Company
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            SELECT COMPANY
          </Typography>
          <Box
            sx={{
              height: 40,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : colors.surface.muted,
              px: 1.75,
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'default',
              userSelect: 'none',
            }}
          >
            {lockedCompanyLabel}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
            The user belongs to this company organization.
          </Typography>
        </Box>

        {/* Assign Branch */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Assign Branch
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            SELECT BRANCH
          </Typography>
          {isBranchLoading ? (
            <Box
              sx={{
                height: 40,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : colors.surface.muted,
                px: 1.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <CircularProgress size={16} sx={{ color: 'primary.main' }} />
              <Typography
                sx={{ fontSize: '0.875rem', color: colors.text.secondary, fontWeight: 500 }}
              >
                Loading branch...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                height: 40,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : colors.white.default,
                px: 1.75,
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {lockedBranchLabel}
            </Box>
          )}
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
            The user will only see data for the selected branch.
          </Typography>
        </Box>

        {/* Assign Role */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Assign Role
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            SELECT ROLE
          </Typography>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={roleOptions}
                value={field.value}
                onChange={(val) => onFieldChange('role', val)}
                placeholder="Select role"
                sx={{ width: '100%' }}
              />
            )}
          />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: { xs: 2, md: 4 },
          rowGap: 3,
        }}
      >
        {/* Assign Company */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Assign Company
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            SELECT COMPANY
          </Typography>
          {currentScope === 'company' ? (
            <Box
              sx={{
                height: 40,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : colors.surface.muted,
                px: 1.75,
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {lockedCompanyLabel}
            </Box>
          ) : (
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <Dropdown
                  options={companyOptions}
                  value={field.value}
                  onChange={(val) => onFieldChange('company', val)}
                  placeholder="Select company"
                  sx={{ width: '100%' }}
                />
              )}
            />
          )}
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
            The user will only see data for the selected branch.
          </Typography>
        </Box>

        {/* Assign Branch */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Assign Branch
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            SELECT BRANCH
          </Typography>
          {isBranchLoading ? (
            <Box
              sx={{
                height: 40,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : colors.surface.muted,
                px: 1.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <CircularProgress size={16} sx={{ color: 'primary.main' }} />
              <Typography
                sx={{ fontSize: '0.875rem', color: colors.text.secondary, fontWeight: 500 }}
              >
                Loading branches...
              </Typography>
            </Box>
          ) : (
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <Dropdown
                  options={branchOptions}
                  value={field.value}
                  onChange={(val) => onFieldChange('branch', val)}
                  placeholder={
                    branchOptions.length === 0 ? 'No branches available' : 'Select branch'
                  }
                  sx={{ width: '100%' }}
                />
              )}
            />
          )}
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.25 }}>
            The user will only see data for the selected branch.
          </Typography>
        </Box>
      </Box>

      {/* Assign Role */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
            Assign Role
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            SELECT ROLE
          </Typography>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={roleOptions}
                value={field.value}
                onChange={(val) => onFieldChange('role', val)}
                placeholder="Select role"
                sx={{ width: '100%' }}
              />
            )}
          />
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }} />
      </Box>
    </>
  );
}

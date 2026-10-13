'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { Card } from '@/components/shared/ui/Card';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import type { CreateUserFormValues } from '@/types/user-roles';

export interface InvitationSuccessStepProps {
  formValues: CreateUserFormValues;
  onGoToDashboard: () => void;
  onAssignNewStaff: () => void;
}

export function InvitationSuccessStep({
  formValues,
  onGoToDashboard,
  onAssignNewStaff,
}: Readonly<InvitationSuccessStepProps>) {
  const fullName = `${formValues.firstName || 'Sarah'} ${formValues.lastName || 'Chen'}`.trim();
  const email = formValues.email || 'sarah.chen@example.com';
  const role = formValues.role || 'Branch Manager';
  const branch = formValues.branch || 'Downtown Branch';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 560,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: { xs: 2, sm: 4 },
        gap: 3,
      }}
    >
      {/* 1. Large Soft Green Checkmark Circle */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.14)',
          color: colors.success.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckIcon sx={{ fontSize: 32, color: colors.success.default, strokeWidth: 2.2 }} />
      </Box>

      {/* 2. Heading & Subtitle */}
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.625rem', sm: '1.875rem' },
            color: 'text.primary',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          Invitation Sent Successfully
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mt: 1,
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}
        >
          An invitation email has been sent to{' '}
          <Box component="strong" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {email}
          </Box>
        </Typography>
      </Box>

      {/* 3. Invitation Summary Card (Established 24px Padding) */}
      <Card
        variant="outlined"
        padding={3}
        sx={{
          width: '100%',
          borderRadius: '16px',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          boxShadow: 'none',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.6875rem',
            color: 'text.secondary',
            letterSpacing: '0.08em',
            textAlign: 'center',
            display: 'block',
            textTransform: 'uppercase',
            mb: 1.5,
          }}
        >
          INVITATION SUMMARY
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {/* User Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              User
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}
            >
              {fullName}
            </Typography>
          </Box>

          {/* Assigned Role Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Assigned Role
            </Typography>
            <StatusChip label={role} variantType="role" pill />
          </Box>

          {/* Branch Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Branch
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}
            >
              {branch}
            </Typography>
          </Box>

          {/* Status Row: Yellow/Amber Dot with Crisp Bold Invited Label */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Status
            </Typography>
            <StatusChip
              status="invited"
              label="Invited"
              showDot
              dotColor={colors.warning.default}
              textColor="text.primary"
              bgColor="transparent"
              sx={{
                height: 24,
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                color: 'text.primary',
                '& .MuiChip-label': {
                  px: 0,
                  color: 'text.primary',
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* 4. Action Buttons (Compact height and padding matching design reference) */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          mt: 0.5,
        }}
      >
        <ActionButton
          variant="outlined"
          onClick={onGoToDashboard}
          sx={{
            height: 38,
            px: 2.5,
            minWidth: 150,
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            color: 'text.primary',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
            },
          }}
        >
          Go To Dashboard
        </ActionButton>

        <ActionButton
          variant="primary"
          onClick={onAssignNewStaff}
          sx={{
            height: 38,
            px: 2.5,
            minWidth: 150,
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.875rem',
            bgcolor: colors.primary.default,
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          Assign New Staff
        </ActionButton>
      </Box>

      {/* 5. Info Callout Box (560 Fill) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: '10px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.15)' : 'rgba(51, 84, 244, 0.06)',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.3)' : 'rgba(51, 84, 244, 0.18)',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <InfoOutlinedIcon
          sx={{
            fontSize: 20,
            color: (theme) => (theme.palette.mode === 'dark' ? '#93C5FD' : colors.primary.default),
            flexShrink: 0,
            mt: 0.25,
          }}
        />
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: (theme) => (theme.palette.mode === 'dark' ? '#DBEAFE' : colors.primary.default),
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          The user will receive an email with instructions to set up their account password and log
          in for the first time.
        </Typography>
      </Box>
    </Box>
  );
}

export default InvitationSuccessStep;

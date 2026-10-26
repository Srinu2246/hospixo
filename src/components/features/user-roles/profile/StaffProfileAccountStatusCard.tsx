'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export interface StaffProfileAccountStatusCardProps {
  userStatusValue: boolean;
  isReadOnly: boolean;
  isEditDisabled: boolean;
  isDeactivating: boolean;
  isActivating: boolean;
  onToggleActivate: () => void;
}

export function StaffProfileAccountStatusCard({
  userStatusValue,
  isReadOnly,
  isEditDisabled,
  isDeactivating,
  isActivating,
  onToggleActivate,
}: Readonly<StaffProfileAccountStatusCardProps>) {
  return (
    <Card
      variant="outlined"
      padding={2.5}
      sx={{
        borderRadius: '12px',
        borderColor: userStatusValue
          ? (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default
          : colors.danger.default,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? colors.surface.darkMuted
            : userStatusValue
              ? 'rgba(249, 250, 251, 0.75)'
              : 'rgba(254, 242, 242, 0.5)',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mt: 1,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
            Account Status
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.35,
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              bgcolor: userStatusValue ? '#DCFCE7' : '#FEE2E2',
              color: userStatusValue ? '#15803D' : '#B91C1C',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: userStatusValue ? '#15803D' : '#B91C1C',
              }}
            />
            {userStatusValue ? 'Active' : 'Inactive'}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: colors.text.secondary, fontSize: '0.8125rem' }}>
          {userStatusValue
            ? 'Staff member is active. They can log in to the system and perform operations according to their assigned role.'
            : 'Staff member is inactive. System access and login privileges are revoked.'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, pt: 2 }}>
        {!isReadOnly && !isEditDisabled && (
          <ActionButton
            variant="outlined"
            size="small"
            onClick={onToggleActivate}
            disabled={isDeactivating || isActivating}
            sx={{
              color: userStatusValue ? colors.danger.default : '#15803D',
              borderColor: userStatusValue ? colors.danger.default : '#15803D',
              bgcolor: 'transparent',
              '&:hover': {
                borderColor: userStatusValue ? colors.danger.dark : '#166534',
                bgcolor: userStatusValue ? 'rgba(239, 68, 68, 0.05)' : 'rgba(22, 163, 74, 0.05)',
              },
            }}
          >
            {userStatusValue ? 'Inactivate' : 'Activate'}
          </ActionButton>
        )}
      </Box>
    </Card>
  );
}

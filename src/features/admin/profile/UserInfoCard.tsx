'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Pencil } from 'lucide-react';

import { Card } from '@/components/shared/ui/Card';
import type { UserProfile } from '@/lib/schemas/admin/profile/adminProfileSchema';

export interface UserInfoCardProps {
  profile: UserProfile;
  onEdit: () => void;
  onToggleTwoFactorLogin: (checked: boolean) => void;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: Readonly<InfoRowProps>) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 0.5, sm: 2 }}
      sx={{ alignItems: { sm: 'center' } }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: 'text.secondary',
          minWidth: { sm: 160 },
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * UserInfoCard
 *
 * Card displaying primary administrator account details, quick edit action,
 * and 2FA login preference toggle.
 */
export function UserInfoCard({
  profile,
  onEdit,
  onToggleTwoFactorLogin,
}: Readonly<UserInfoCardProps>) {
  const phoneNumbersFormatted =
    profile.mobileNumbers.length > 0
      ? profile.mobileNumbers.map((p) => p.number).join(', ')
      : 'None';

  return (
    <Card variant="outlined" borderRadius="12px" padding={2.5} sx={{ bgcolor: 'background.paper' }}>
      {/* Header */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>
          User info
        </Typography>
        <IconButton
          onClick={onEdit}
          size="small"
          aria-label="Edit user info"
          sx={{
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px',
            p: 0.75,
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          <Pencil size={16} />
        </IconButton>
      </Stack>

      {/* Info Rows */}
      <Stack spacing={1.5}>
        <InfoRow label="Name" value={profile.name} />
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Mobile numbers" value={phoneNumbersFormatted} />
      </Stack>

      <Divider sx={{ my: 2, borderColor: 'divider' }} />

      {/* 2FA for Login Toggle */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Switch
          checked={profile.twoFactorLogin}
          onChange={(_event, checked) => onToggleTwoFactorLogin(checked)}
          color="primary"
          sx={{ mt: -0.25, flexShrink: 0 }}
        />
        <Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.3,
            }}
          >
            2FA For Login
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
            Keep your account safe and secure with 2FA
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

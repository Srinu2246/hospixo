'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Card } from '@/components/shared/ui/Card';
import type {
  ChangePasswordValues,
  UserProfile,
} from '@/lib/schemas/admin/profile/adminProfileSchema';
import { colors } from '@/lib/theme/mui/colors';

import { ChangePasswordForm } from './ChangePasswordForm';

export interface SecurityPasswordCardProps {
  profile: UserProfile;
  onToggleTwoFactorProtection: (checked: boolean) => void;
  onChangePassword: (passwords: ChangePasswordValues) => void;
}

/**
 * SecurityPasswordCard
 *
 * Handles 2FA protection state and password management.
 * Toggles between overview state and change password form.
 */
export function SecurityPasswordCard({
  profile,
  onToggleTwoFactorProtection,
  onChangePassword,
}: Readonly<SecurityPasswordCardProps>) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  function handleCancelPassword() {
    setIsChangingPassword(false);
  }

  function handleSubmitPassword(passwords: ChangePasswordValues) {
    setPasswordSubmitting(true);
    onChangePassword(passwords);
    setPasswordSubmitting(false);
    setIsChangingPassword(false);
  }

  return (
    <Card variant="outlined" borderRadius="12px" padding={2.5} sx={{ bgcolor: 'background.paper' }}>
      {/* 1. Two-Factor Authentication Section */}
      <Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>
          Two-factor authentication
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.5, mb: 2 }}>
          Strengthen your account security with 2FA.
        </Typography>

        {/* Protection Banner */}
        {profile.twoFactorProtection ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: '8px',
              bgcolor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.24)',
            }}
          >
            <ShieldCheck size={18} color={colors.success.default} />
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: colors.success.dark,
              }}
            >
              2FA is currently active and secure protecting your account.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: '8px',
              bgcolor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.24)',
            }}
          >
            <AlertCircle size={18} color={colors.warning.default} />
            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: colors.warning.dark,
              }}
            >
              2FA is currently inactive. Turn on 2FA protection below to secure your account.
            </Typography>
          </Box>
        )}

        {/* 2FA Protection Toggle Row */}
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
            2FA Protection State
          </Typography>
          <Switch
            checked={profile.twoFactorProtection}
            onChange={(_event, checked) => onToggleTwoFactorProtection(checked)}
            color="primary"
          />
        </Stack>
      </Box>

      <Divider sx={{ my: 2, borderColor: 'divider' }} />

      {/* 2. Security & Password Section */}
      {isChangingPassword ? (
        <ChangePasswordForm
          onCancel={handleCancelPassword}
          onSubmit={handleSubmitPassword}
          loading={passwordSubmitting}
        />
      ) : (
        <Box>
          <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>
            Security & Password
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.5, mb: 2 }}>
            Choose a strong, unique password to secure your account.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
            <KeyRound size={16} color={colors.text.secondary} />
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              For your security, we suggest regular updates and using unique alphanumeric passwords.
            </Typography>
          </Stack>

          <ActionButton
            variant="primary"
            startIcon={<KeyRound size={16} />}
            onClick={() => setIsChangingPassword(true)}
          >
            Change Password
          </ActionButton>
        </Box>
      )}
    </Card>
  );
}

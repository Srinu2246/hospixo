'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { PasswordInput } from '@/components/shared/form-fields/PasswordInput';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import { useChangePassword } from '@/lib/hooks/admin/profile/useChangePassword';
import { changePasswordSchema } from '@/lib/schemas/admin/profile/adminProfileSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface ChangePasswordFormProps {
  onCancel: () => void;
  onSuccess: (message: string) => void;
}

interface RuleItemProps {
  satisfied: boolean;
  label: string;
}

function RuleBullet({ satisfied, label }: Readonly<RuleItemProps>) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: satisfied ? colors.success.default : colors.danger.default,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: satisfied ? 'text.primary' : 'text.secondary',
          fontWeight: satisfied ? 500 : 400,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

/**
 * ChangePasswordForm
 *
 * Password update form with interactive validation rules matching reference screen 1.
 */
export function ChangePasswordForm({ onCancel, onSuccess }: Readonly<ChangePasswordFormProps>) {
  const changePasswordMutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ruleLength = newPassword.length >= 8;
  const ruleLower = /[a-z]/.test(newPassword);
  const ruleUpper = /[A-Z]/.test(newPassword);
  const ruleNumber = /[0-9]/.test(newPassword);
  const ruleSpecial = /[@!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  const allRulesSatisfied = ruleLength && ruleLower && ruleUpper && ruleNumber && ruleSpecial;

  const isPending = changePasswordMutation.isPending;

  const canSubmit =
    Boolean(currentPassword.trim()) &&
    allRulesSatisfied &&
    Boolean(confirmPassword) &&
    newPassword === confirmPassword &&
    !isPending;

  async function handleSubmit() {
    const parseResult = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (!parseResult.success) {
      setErrorMessage(parseResult.error.issues[0]?.message ?? 'Invalid password inputs');
      return;
    }

    setErrorMessage(null);
    try {
      const response = await changePasswordMutation.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });

      let successMsg = 'Password changed successfully';
      if (typeof response === 'object' && response) {
        const res = response as {
          message?: string;
          data?: { message?: string; detail?: string };
        };
        if (res.data?.message) {
          successMsg = res.data.message;
        } else if (res.message && res.message !== 'OK') {
          successMsg = res.message;
        }
      }

      onSuccess(successMsg);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, 'Failed to change password. Please check your current password.'),
      );
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>
        Change Password
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.5, mb: 1.5 }}>
        Update your current credentials regularly for a safer account access.
      </Typography>

      <Stack spacing={1.5}>
        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          required
          placeholder="Enter your current password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          showCriteria={false}
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          required
          placeholder="Enter a strong password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          showCriteria={false}
        />

        {/* 5-Rule Checklist Container */}
        <Box
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(241, 245, 249, 0.6)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px',
            p: 1.5,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            <Stack spacing={1}>
              <RuleBullet satisfied={ruleLength} label="At least 8 characters" />
              <RuleBullet satisfied={ruleLower} label="At least 1 lowercase letter (a-z)" />
              <RuleBullet satisfied={ruleSpecial} label="At least 1 special character (@!$%)" />
            </Stack>
            <Stack spacing={1}>
              <RuleBullet satisfied={ruleNumber} label="At least 1 number (0-9)" />
              <RuleBullet satisfied={ruleUpper} label="At least 1 uppercase letter (A-Z)" />
            </Stack>
          </Box>
        </Box>

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          required
          placeholder="Confirm your new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          error={Boolean(confirmPassword && confirmPassword !== newPassword)}
          helperText={
            confirmPassword && confirmPassword !== newPassword
              ? 'Passwords do not match'
              : undefined
          }
          showCriteria={false}
        />

        {errorMessage ? (
          <AlertMessage variant="error" message={errorMessage} sx={{ width: '100%' }} />
        ) : null}

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'flex-end', alignItems: 'center', pt: 1 }}
        >
          <ActionButton variant="text" onClick={onCancel} disabled={isPending}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleSubmit}
            loading={isPending}
            disabled={!canSubmit}
          >
            Change Password
          </ActionButton>
        </Stack>
      </Stack>
    </Box>
  );
}

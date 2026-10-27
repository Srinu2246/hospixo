'use client';

import React from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { Input } from '@/components/shared/form-fields/Input';
import { MobileNumberInput } from '@/components/shared/form-fields/MobileNumberInput';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import { isPlaceholderEmail } from '@/lib/helpers/employees/userRolesHelpers';
import type { StaffProfileFormValues } from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface StaffProfileBasicInfoSectionProps {
  control: Control<StaffProfileFormValues>;
  errors: FieldErrors<StaffProfileFormValues>;
  isReadOnly: boolean;
  countryCode: string;
  assignedCompany?: string;
  assignedBranch?: string;
  showAssignedBranch?: boolean;
  onCountryCodeChange: (code: string) => void;
  onSendResetPassword: () => void;
}

const profileFieldsGridSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
  },
  columnGap: { xs: 2, md: 3 },
  rowGap: 3,
} as const;

const lockedFieldLabelSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: colors.text.secondary,
  textTransform: 'uppercase',
} as const;

const lockedFieldBoxSx = {
  height: 40,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: (theme: { palette: { mode: string; divider: string } }) =>
    theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
  bgcolor: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : colors.surface.muted,
  px: 1.75,
  display: 'flex',
  alignItems: 'center',
  color: 'text.primary',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'default',
  userSelect: 'none',
} as const;

function LockedProfileField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography sx={lockedFieldLabelSx}>{label}</Typography>
      <Box sx={lockedFieldBoxSx}>{value}</Box>
    </Box>
  );
}

export function StaffProfileBasicInfoSection({
  control,
  errors,
  isReadOnly,
  countryCode,
  assignedCompany,
  assignedBranch,
  showAssignedBranch = false,
  onCountryCodeChange,
  onSendResetPassword,
}: Readonly<StaffProfileBasicInfoSectionProps>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 2 }}>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Basic Information
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: colors.text.secondary, mt: 0.25, fontSize: '0.8125rem' }}
        >
          Basic contact credentials and system access identity.
        </Typography>
      </Box>

      <Box sx={profileFieldsGridSx}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Input
              label="FIRST NAME"
              required
              placeholder="Enter first name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isReadOnly}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName?.message}
              reserveHelperSpace={false}
              fullWidth
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              label="LAST NAME"
              required
              placeholder="Enter last name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isReadOnly}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName?.message}
              reserveHelperSpace={false}
              fullWidth
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => {
            if (isReadOnly && isPlaceholderEmail(field.value)) {
              return null;
            }

            return (
              <Input
                label="EMAIL ADDRESS"
                type="email"
                placeholder="Optional — name@company.com"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={isReadOnly}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                reserveHelperSpace={false}
                fullWidth
              />
            );
          }}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <MobileNumberInput
              label="PHONE NUMBER"
              required
              countryCode={countryCode || '+91'}
              onCountryCodeChange={onCountryCodeChange}
              placeholder="98765 43210"
              phoneNumber={field.value}
              onPhoneNumberChange={(val) => field.onChange(val.replace(/\D/g, ''))}
              disabled={isReadOnly}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber?.message}
            />
          )}
        />

        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Input
              label="USERNAME"
              required
              placeholder="e.g. john.doe"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isReadOnly}
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              reserveHelperSpace={false}
              fullWidth
            />
          )}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={lockedFieldLabelSx}>Password & Security</Typography>
          <Box sx={{ mt: 0.5 }}>
            <ActionButton
              variant="outlined"
              size="small"
              startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={onSendResetPassword}
              sx={{ height: 42 }}
            >
              Reset Password
            </ActionButton>
          </Box>
        </Box>

        <LockedProfileField label="Assigned Company" value={assignedCompany || '—'} />

        {showAssignedBranch ? (
          <LockedProfileField
            label="Assigned Branch"
            value={assignedBranch?.trim() ? assignedBranch : '—'}
          />
        ) : null}
      </Box>
    </Box>
  );
}

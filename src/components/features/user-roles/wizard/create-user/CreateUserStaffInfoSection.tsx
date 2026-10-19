'use client';

import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Input } from '@/components/shared/form-fields/Input';
import { MobileNumberInput } from '@/components/shared/form-fields/MobileNumberInput';
import type { CreateUserFormValues } from '@/lib/schemas/employees/user-roles/userRolesSchema';

export interface CreateUserStaffInfoSectionProps {
  control: Control<CreateUserFormValues>;
  countryCode: string;
  onFieldChange: (field: keyof CreateUserFormValues, value: string | boolean) => void;
}

export function CreateUserStaffInfoSection({
  control,
  countryCode,
  onFieldChange,
}: Readonly<CreateUserStaffInfoSectionProps>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography
        sx={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'text.primary',
        }}
      >
        Staff Information
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: { xs: 2, md: 4 },
          rowGap: 3,
        }}
      >
        {/* First Name */}
        <Controller
          name="firstName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="FIRST NAME"
              required
              placeholder="Enter first name"
              value={field.value}
              onChange={(e) => onFieldChange('firstName', e.target.value)}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        {/* Last Name */}
        <Controller
          name="lastName"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="LAST NAME"
              required
              placeholder="Enter last name"
              value={field.value}
              onChange={(e) => onFieldChange('lastName', e.target.value)}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        {/* Phone Number (Reusing shared MobileNumberInput) */}
        <Controller
          name="phoneNumber"
          control={control}
          render={({ field, fieldState }) => (
            <MobileNumberInput
              label="PHONE NUMBER"
              required
              countryCode={countryCode || '+91'}
              onCountryCodeChange={(code) => onFieldChange('countryCode', code)}
              placeholder="98765 43210"
              phoneNumber={field.value}
              onPhoneNumberChange={(value) => onFieldChange('phoneNumber', value)}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
            />
          )}
        />

        {/* Email Address */}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="EMAIL ADDRESS"
              required
              type="email"
              placeholder="e.g. sarah.chen@example.com"
              value={field.value}
              onChange={(e) => onFieldChange('email', e.target.value)}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        {/* Username */}
        <Controller
          name="username"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="USERNAME"
              required
              placeholder="Create Username"
              value={field.value}
              onChange={(e) => onFieldChange('username', e.target.value)}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="PASSWORD"
              required
              type="password"
              placeholder="Create Password"
              value={field.value}
              onChange={(e) => onFieldChange('password', e.target.value)}
              onBlur={field.onBlur}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            />
          )}
        />
      </Box>
    </Box>
  );
}

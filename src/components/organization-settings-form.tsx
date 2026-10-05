'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, MenuItem, TextField, Typography } from '@mui/material';

import {
  normalizeOrganizationSettings,
  organizationSettingsSchema,
  type OrganizationSettingsInput,
} from '@/lib/organization-settings-schema';

const TIMEZONE_OPTIONS = ['Asia/Kolkata', 'Asia/Dubai', 'UTC'] as const;

export default function OrganizationSettingsForm() {
  const [savedPayload, setSavedPayload] = useState<OrganizationSettingsInput | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationSettingsInput>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: { name: '', countryCode: '', city: '', timezone: '' },
  });

  function onSubmit(values: OrganizationSettingsInput) {
    // Schema already validated — normalize codes, then send to the API.
    setSavedPayload(normalizeOrganizationSettings(values));
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}
    >
      <Typography variant="h2">Organization settings</Typography>

      <TextField
        label="Organization name"
        {...register('name')}
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
      />
      <TextField
        label="Country code"
        placeholder="IN"
        {...register('countryCode')}
        error={Boolean(errors.countryCode)}
        helperText={errors.countryCode?.message ?? '2-letter ISO code'}
      />
      <TextField
        label="City"
        {...register('city')}
        error={Boolean(errors.city)}
        helperText={errors.city?.message}
      />
      <Controller
        name="timezone"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Timezone"
            {...field}
            error={Boolean(errors.timezone)}
            helperText={errors.timezone?.message}
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Button type="submit" variant="contained" disabled={isSubmitting}>
        Save changes
      </Button>

      {savedPayload ? (
        <Alert severity="success">Validated payload: {JSON.stringify(savedPayload)}</Alert>
      ) : null}
    </Box>
  );
}

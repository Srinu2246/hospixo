'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Input } from '@/components/shared/form-fields/Input';
import { Loading } from '@/components/shared/ui/Loading';
import { SetupCard } from '@/components/features/floor-and-table-setup/SetupFields';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { screen } from '@/lib/theme/mui/breakpoints';
import type { FloorDetails } from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  canSubmitSetupForm,
  floorFormSchema,
  type FloorFormValues,
} from '@/lib/schemas/floor-and-table-setup/floorSetupFormSchema';

export function FloorCreationStep({
  details,
  nameError,
  loading = false,
  onChange,
  onCanSaveChange,
}: Readonly<{
  details: FloorDetails;
  nameError: string | null;
  loading?: boolean;
  onChange: (details: FloorDetails) => void;
  onCanSaveChange: (canSave: boolean) => void;
}>) {
  const { control, getValues, trigger, formState } = useForm<FloorFormValues>({
    resolver: zodResolver(floorFormSchema),
    defaultValues: {
      name: details.name,
      code: details.code,
      description: details.description,
      active: details.active,
    },
    mode: 'onChange',
  });

  const canSave = canSubmitSetupForm('add', formState);

  useEffect(() => {
    void trigger();
  }, [trigger]);

  useEffect(() => {
    onCanSaveChange(canSave);
    return () => onCanSaveChange(false);
  }, [canSave, onCanSaveChange]);

  function publish() {
    const values = getValues();
    onChange({
      name: values.name,
      code: values.code,
      description: values.description,
      active: true,
    });
  }

  if (loading) {
    return <Loading message="Loading floor..." fullPage={false} />;
  }

  return (
    <SetupCard>
      <Typography
        component="h2"
        sx={{
          fontWeight: 700,
          fontSize: { [screen.mobile]: '1.05rem', [screen.desktop]: '1.125rem' },
          mb: 2.5,
        }}
      >
        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
          Floor Details
        </Box>
        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
          Floor Creation
        </Box>
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => {
            const message = fieldState.error?.message ?? nameError ?? undefined;
            const showError = Boolean(fieldState.isTouched ? fieldState.error : nameError);
            return (
              <Input
                id="floor-name"
                label="Floor Name"
                required
                placeholder="Ground Floor"
                value={field.value}
                error={showError}
                helperText={showError ? message : undefined}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event);
                  publish();
                }}
              />
            );
          }}
        />
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              id="floor-code"
              label="Floor Code"
              placeholder="GF-001"
              helperText="Assigned code for orders routing"
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event);
                publish();
              }}
            />
          )}
        />
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              id="floor-description"
              label="Description"
              placeholder="Enter floor description"
              value={field.value}
              multiline
              rows={4}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event);
                publish();
              }}
            />
          )}
        />
      </Box>
      <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <LabeledSwitch
          title="Floor Status"
          hint="New floors are created as active."
          checked
          disabled
          onChange={() => undefined}
        />
      </Box>
    </SetupCard>
  );
}

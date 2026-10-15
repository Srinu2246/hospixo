'use client';

import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { TextAreaField, TextField } from '@/components/form/wizard-shared';
import { FloorSetupSelectField } from '@/features/floor-table-setup/components/shared/floor-setup-select-field';
import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import { floorTypeFormOptions, wizardCopy } from '@/features/floor-table-setup/config';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import type {
  FloorDraftForm,
  FloorType,
} from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type FloorCreationStepProps = Readonly<{
  value: FloorDraftForm;
  onChange: (next: FloorDraftForm) => void;
  title?: string;
  errors?: Partial<Record<'name' | 'code' | 'description' | 'status', string>>;
}>;

const floorTypeSelectOptions = floorTypeFormOptions.map((option) => ({
  value: option.id,
  label: option.label,
}));

export function FloorCreationStep({
  value,
  onChange,
  title = wizardCopy.floorTitle,
  errors,
}: FloorCreationStepProps) {
  const { isCompactLayout, isTabletLayout } = useFloorTableSetupResponsive();

  if (isCompactLayout) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, width: '100%' }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isTabletLayout ? 'repeat(2, minmax(0, 1fr))' : '1fr',
            gap: 2,
          }}
        >
          <TextField
            label={wizardCopy.floorName}
            required
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
            error={errors?.name}
          />
          <TextField
            label={wizardCopy.floorCode}
            required
            value={value.code}
            onChange={(event) => onChange({ ...value, code: event.target.value })}
            error={errors?.code}
            hint={errors?.code ? undefined : wizardCopy.floorCodeHint}
          />
          <Stack sx={{ gridColumn: isTabletLayout ? '1 / -1' : undefined }}>
            <FloorSetupSelectField
              label={wizardCopy.floorType}
              value={value.type || ''}
              onChange={(next) => onChange({ ...value, type: next as FloorType | '' })}
              options={[
                { value: '', label: wizardCopy.floorTypePlaceholder },
                ...floorTypeSelectOptions,
              ]}
            />
          </Stack>
          <Stack sx={{ gridColumn: '1 / -1' }}>
            <TextAreaField
              label={wizardCopy.description}
              value={value.description}
              placeholder={wizardCopy.descriptionPlaceholder}
              onChange={(event) => onChange({ ...value, description: event.target.value })}
              error={errors?.description}
            />
          </Stack>
          <Box
            sx={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {wizardCopy.floorStatus}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {wizardCopy.floorStatusHint}
              </Typography>
            </Box>
            <Switch
              checked={value.active}
              onChange={(_, active) => onChange({ ...value, active })}
              slotProps={{ input: { 'aria-label': wizardCopy.floorStatus } }}
            />
          </Box>
        </Box>
        {errors?.status ? (
          <FormHelperText error sx={{ mt: 0.5, mx: 0 }}>
            {errors.status}
          </FormHelperText>
        ) : null}
      </Paper>
    );
  }

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>

      <div className={styles.grid2}>
        <TextField
          label={wizardCopy.floorName}
          required
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          error={errors?.name}
        />
        <TextField
          label={wizardCopy.floorCode}
          required
          value={value.code}
          onChange={(event) => onChange({ ...value, code: event.target.value })}
          error={errors?.code}
          hint={errors?.code ? undefined : wizardCopy.floorCodeHint}
        />
      </div>

      <TextAreaField
        label={wizardCopy.description}
        value={value.description}
        placeholder={wizardCopy.descriptionPlaceholder}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
        error={errors?.description}
        className={styles.descriptionField}
      />

      <StatusToggle
        label={wizardCopy.floorStatus}
        hint={wizardCopy.floorStatusHint}
        checked={value.active}
        onChange={(active) => onChange({ ...value, active })}
      />
      {errors?.status ? (
        <FormHelperText error sx={{ mt: 0.5, mx: 0 }}>
          {errors.status}
        </FormHelperText>
      ) : null}
    </section>
  );
}

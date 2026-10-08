'use client';

import { TextAreaField, TextField } from '@/components/form/wizard-shared';
import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import { wizardCopy } from '@/features/floor-table-setup/config';
import type { FloorDraftForm } from '@/features/floor-table-setup/types/floor-table-setup';

import styles from './wizard.module.css';

type FloorCreationStepProps = Readonly<{
  value: FloorDraftForm;
  onChange: (next: FloorDraftForm) => void;
  title?: string;
  errors?: Partial<Record<'name' | 'code' | 'description', string>>;
}>;

export function FloorCreationStep({
  value,
  onChange,
  title = wizardCopy.floorTitle,
  errors,
}: FloorCreationStepProps) {
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
    </section>
  );
}

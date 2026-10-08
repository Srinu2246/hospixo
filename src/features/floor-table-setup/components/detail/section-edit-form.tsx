'use client';

import FormHelperText from '@mui/material/FormHelperText';

import { AsyncButton } from '@/features/floor-table-setup/components/shared/async-button';
import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import { detailCopy, floorTableSetupCopy, wizardCopy } from '@/features/floor-table-setup/config';
import type { SectionDraft } from '@/features/floor-table-setup/types/floor-table-setup';

import wizardStyles from '../wizard/wizard.module.css';

type SectionEditFormProps = Readonly<{
  value: SectionDraft;
  onChange: (next: SectionDraft) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
  loading?: boolean;
  showFooter?: boolean;
  statusError?: string | null;
}>;

export function SectionEditForm({
  value,
  onChange,
  onCancel,
  onSave,
  loading = false,
  showFooter = true,
  statusError = null,
}: SectionEditFormProps) {
  async function handleSave() {
    await onSave();
  }

  return (
    <div className={wizardStyles.page}>
      <section className={wizardStyles.card}>
        <h2 className={wizardStyles.cardTitle}>{detailCopy.editSection}</h2>
        <div className={wizardStyles.grid2}>
          <label className={wizardStyles.field}>
            <span className={wizardStyles.label}>{wizardCopy.sectionName}</span>
            <input
              className={wizardStyles.input}
              value={value.name}
              placeholder={wizardCopy.sectionNamePlaceholder}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
            />
          </label>
          <label className={wizardStyles.field}>
            <span className={wizardStyles.label}>{wizardCopy.sectionCode}</span>
            <input
              className={wizardStyles.input}
              value={value.code}
              placeholder={wizardCopy.sectionCodePlaceholder}
              onChange={(event) => onChange({ ...value, code: event.target.value })}
            />
            <span className={wizardStyles.hint}>{wizardCopy.sectionCodeHint}</span>
          </label>
        </div>
        <label className={wizardStyles.field}>
          <span className={wizardStyles.label}>{wizardCopy.description}</span>
          <textarea
            className={wizardStyles.textarea}
            value={value.description}
            placeholder={wizardCopy.sectionDescriptionPlaceholder}
            onChange={(event) => onChange({ ...value, description: event.target.value })}
          />
        </label>
        <StatusToggle
          label={wizardCopy.sectionStatus}
          hint={wizardCopy.sectionStatusHint}
          checked={value.active}
          onChange={(active) => onChange({ ...value, active })}
        />
        {statusError ? (
          <FormHelperText error sx={{ mt: 0.5, mx: 0 }}>
            {statusError}
          </FormHelperText>
        ) : null}
      </section>
      {showFooter ? (
        <div className={wizardStyles.footer}>
          <AsyncButton className={wizardStyles.secondary} onClick={onCancel} disabled={loading}>
            {detailCopy.cancel}
          </AsyncButton>
          <AsyncButton
            className={wizardStyles.primary}
            loading={loading}
            loadingLabel={floorTableSetupCopy.saving}
            onClick={() => void handleSave()}
            disabled={!value.name.trim()}
          >
            {detailCopy.saveChanges}
          </AsyncButton>
        </div>
      ) : null}
    </div>
  );
}

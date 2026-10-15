'use client';

import { useId, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

import { TextAreaField, TextField } from '@/components/form/wizard-shared';
import dialogStyles from '@/features/floor-table-setup/components/add-floor/add-floor.module.css';
import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import { wizardCopy } from '@/features/floor-table-setup/config';

type SectionFormInput = Readonly<{
  name: string;
  code: string;
  description: string;
  active: boolean;
}>;

type SectionModalProps = Readonly<{
  open: boolean;
  defaultCode: string;
  initial?: SectionFormInput;
  title?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (input: SectionFormInput) => boolean | string | void | Promise<boolean | string | void>;
}>;

export function SectionModal({
  open,
  defaultCode,
  initial,
  title,
  submitLabel,
  onClose,
  onSubmit,
}: SectionModalProps) {
  if (!open) return null;

  const formKey = initial ? `${initial.code}-${initial.name}` : defaultCode;

  return (
    <SectionModalForm
      key={formKey}
      defaultCode={defaultCode}
      initial={initial}
      title={title}
      submitLabel={submitLabel}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function SectionModalForm({
  defaultCode,
  initial,
  title,
  submitLabel,
  onClose,
  onSubmit,
}: Readonly<{
  defaultCode: string;
  initial?: SectionFormInput;
  title?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: SectionModalProps['onSubmit'];
}>) {
  const titleId = useId();
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? defaultCode);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setBusy(true);
    try {
      const result = await onSubmit({ name, code, description, active });
      if (result !== false) onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={dialogStyles.overlay} role="presentation" onClick={onClose}>
      <form
        className={`${dialogStyles.dialog} ${dialogStyles.dialogWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className={dialogStyles.header}>
          <h2 id={titleId} className={dialogStyles.title}>
            {title ?? wizardCopy.createSectionTitle}
          </h2>
          <button type="button" className={dialogStyles.close} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <TextField
          label={wizardCopy.sectionName}
          required
          value={name}
          placeholder={wizardCopy.sectionNamePlaceholder}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
        <TextField
          label={wizardCopy.sectionCode}
          required
          value={code}
          placeholder={wizardCopy.sectionCodePlaceholder}
          hint={wizardCopy.sectionCodeHint}
          onChange={(event) => setCode(event.target.value)}
        />
        <TextAreaField
          label={wizardCopy.description}
          value={description}
          placeholder={wizardCopy.sectionDescriptionPlaceholder}
          onChange={(event) => setDescription(event.target.value)}
        />
        <StatusToggle
          label={wizardCopy.sectionStatus}
          hint={wizardCopy.sectionStatusHint}
          checked={active}
          onChange={setActive}
        />
        <div className={dialogStyles.footer}>
          <button type="button" className={dialogStyles.cancel} onClick={onClose} disabled={busy}>
            {wizardCopy.cancel}
          </button>
          <button type="submit" className={dialogStyles.submit} disabled={!name.trim() || busy}>
            {submitLabel ?? wizardCopy.createSection}
          </button>
        </div>
      </form>
    </div>
  );
}

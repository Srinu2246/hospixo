'use client';

import { useId, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { TextAreaField, TextField } from '@/components/form/wizard-shared';
import dialogStyles from '@/features/floor-table-setup/components/add-floor/add-floor.module.css';
import { FloorSetupCompactStickyFooter } from '@/features/floor-table-setup/components/shared/compact-layout';
import { compactTouchButtonSx } from '@/features/floor-table-setup/components/shared/compact-layout/compact-layout-sx';
import { StatusToggle } from '@/features/floor-table-setup/components/status-toggle';
import { wizardCopy } from '@/features/floor-table-setup/config';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';

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
  const { isCompactLayout } = useFloorTableSetupResponsive();
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

  const fields = (
    <>
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
      {isCompactLayout ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {wizardCopy.sectionStatus}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {wizardCopy.sectionStatusHint}
            </Typography>
          </Box>
          <Switch
            checked={active}
            onChange={(_, checked) => setActive(checked)}
            slotProps={{ input: { 'aria-label': wizardCopy.sectionStatus } }}
          />
        </Box>
      ) : (
        <StatusToggle
          label={wizardCopy.sectionStatus}
          hint={wizardCopy.sectionStatusHint}
          checked={active}
          onChange={setActive}
        />
      )}
    </>
  );

  if (isCompactLayout) {
    return (
      <Dialog
        open
        onClose={onClose}
        aria-labelledby={titleId}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              width: 'calc(100% - 32px)',
              maxWidth: 'calc(100% - 32px)',
              m: 2,
              borderRadius: 2,
            },
          },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle id={titleId} sx={{ pr: 6 }}>
            {title ?? wizardCopy.createSectionTitle}
            <IconButton
              aria-label="Close"
              onClick={onClose}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <X size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>{fields}</Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 0, width: '100%' }}>
            <FloorSetupCompactStickyFooter
              back={
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={onClose}
                  disabled={busy}
                  sx={compactTouchButtonSx}
                >
                  {wizardCopy.cancel}
                </Button>
              }
              primary={
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!name.trim() || busy}
                  sx={compactTouchButtonSx}
                >
                  {submitLabel ?? wizardCopy.createSection}
                </Button>
              }
            />
          </DialogActions>
        </Box>
      </Dialog>
    );
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
        {fields}
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

'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { FloorSetupCompactStickyFooter } from '@/features/floor-table-setup/components/shared/compact-layout';
import { compactTouchButtonSx } from '@/features/floor-table-setup/components/shared/compact-layout/compact-layout-sx';
import {
  floorSetupFieldSx,
  floorSetupRequiredLabel,
} from '@/features/floor-table-setup/components/shared/mui-field-styles';
import { useFloorTableSetupResponsive } from '@/features/floor-table-setup/hooks/use-responsive-layout';
import {
  bulkGenerateDefaults,
  createTableDefaults,
  tableCapacityOptions,
  wizardCopy,
} from '@/features/floor-table-setup/config';
import {
  generateTableNumbers,
  NEW_TABLE_SECTION_ID,
  nextTableNumber,
  validateTableNumberRange,
  type NewTableSectionInput,
} from '@/features/floor-table-setup/lib/draft';

export type TableFormValue = Readonly<{
  startNumber: string;
  count: number;
  capacity: number;
  reservations: boolean;
  sectionId?: string;
  newSection?: NewTableSectionInput;
}>;

type TableModalSection = Readonly<{
  id: string;
  name: string;
}>;

type TableModalProps = Readonly<{
  open: boolean;
  mode: 'single' | 'bulk';
  defaultStart: string;
  /** All existing tables in the floor scope — used for next-number and duplicate checks. */
  existingTables?: readonly { number: string }[];
  sections?: readonly TableModalSection[];
  defaultSectionId?: string;
  defaultSectionCode?: string;
  onClose: () => void;
  onGenerate: (value: TableFormValue) => boolean | void | Promise<boolean | void>;
}>;

export function TableModal({
  open,
  mode,
  defaultStart,
  existingTables = [],
  sections = [],
  defaultSectionId,
  defaultSectionCode,
  onClose,
  onGenerate,
}: TableModalProps) {
  const sectionsKey = sections.map((section) => section.id).join(',');

  return (
    <TableModalForm
      key={`${mode}-${defaultStart}-${defaultSectionId ?? ''}-${defaultSectionCode ?? ''}-${sectionsKey}-${existingTables.length}`}
      open={open}
      mode={mode}
      defaultStart={defaultStart}
      existingTables={existingTables}
      sections={sections}
      defaultSectionId={defaultSectionId}
      defaultSectionCode={defaultSectionCode}
      onClose={onClose}
      onGenerate={onGenerate}
    />
  );
}

function TableModalForm({
  open,
  mode,
  defaultStart,
  existingTables,
  sections,
  defaultSectionId,
  defaultSectionCode = '',
  onClose,
  onGenerate,
}: Readonly<{
  open: boolean;
  mode: 'single' | 'bulk';
  defaultStart: string;
  existingTables: readonly { number: string }[];
  sections: readonly TableModalSection[];
  defaultSectionId?: string;
  defaultSectionCode?: string;
  onClose: () => void;
  onGenerate: TableModalProps['onGenerate'];
}>) {
  const defaults = mode === 'bulk' ? bulkGenerateDefaults : createTableDefaults;
  const [startNumber, setStartNumber] = useState(defaultStart || defaults.startNumber);
  const [startTouched, setStartTouched] = useState(false);
  const [count, setCount] = useState(String(defaults.count ?? 1));
  const [capacity, setCapacity] = useState(String(defaults.capacity));
  const [reservations, setReservations] = useState<boolean>(defaults.reservations);
  const [sectionId, setSectionId] = useState(
    defaultSectionId ?? sections[0]?.id ?? NEW_TABLE_SECTION_ID,
  );
  const [sectionName, setSectionName] = useState('');
  const [sectionCode, setSectionCode] = useState(defaultSectionCode);
  const [busy, setBusy] = useState(false);
  const { isCompactLayout } = useFloorTableSetupResponsive();
  const creatingSection = sections.length === 0 || sectionId === NEW_TABLE_SECTION_ID;

  const parsedCount = mode === 'bulk' ? Number(count) : 1;
  const parsedCapacity = Number(capacity);

  const previewNumbers = useMemo(
    () => generateTableNumbers(startNumber, parsedCount),
    [startNumber, parsedCount],
  );

  const rangeValidation = useMemo(
    () => validateTableNumberRange(existingTables, startNumber, parsedCount),
    [existingTables, startNumber, parsedCount],
  );

  function handleSectionChange(nextSectionId: string) {
    setSectionId(nextSectionId);
    if (!startTouched) {
      setStartNumber(nextTableNumber(existingTables));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!startNumber.trim() || parsedCount < 1 || parsedCapacity < 1) return;
    if (creatingSection && !sectionName.trim()) return;
    if (!creatingSection && !sectionId) return;
    if (!rangeValidation.ok) return;

    setBusy(true);
    try {
      const result = await onGenerate({
        startNumber,
        count: parsedCount,
        capacity: parsedCapacity,
        reservations,
        sectionId: creatingSection ? undefined : sectionId,
        newSection: creatingSection
          ? {
              name: sectionName,
              code: sectionCode.trim() || defaultSectionCode,
            }
          : undefined,
      });
      if (result !== false) onClose();
    } finally {
      setBusy(false);
    }
  }

  const dialogPaperSx = isCompactLayout
    ? {
        width: 'calc(100% - 32px)',
        maxWidth: 'calc(100% - 32px)',
        m: 2,
        borderRadius: 2,
      }
    : undefined;

  const cancelButton = (
    <Button
      type="button"
      variant="outlined"
      onClick={onClose}
      disabled={busy}
      fullWidth={isCompactLayout}
      sx={isCompactLayout ? compactTouchButtonSx : undefined}
    >
      {wizardCopy.cancel}
    </Button>
  );

  const submitButton = (
    <Button
      type="submit"
      variant="contained"
      disabled={
        busy ||
        (creatingSection && !sectionName.trim()) ||
        !rangeValidation.ok ||
        parsedCount < 1 ||
        parsedCapacity < 1
      }
      fullWidth={isCompactLayout}
      sx={isCompactLayout ? compactTouchButtonSx : undefined}
    >
      {wizardCopy.generate}
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={isCompactLayout ? false : 'sm'}
      scroll="paper"
      slotProps={dialogPaperSx ? { paper: { sx: dialogPaperSx } } : undefined}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          {mode === 'bulk' ? wizardCopy.bulkTitle : wizardCopy.createTableTitle}
          {mode === 'bulk' ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {wizardCopy.bulkSubtitle}
            </Typography>
          ) : null}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            {sections.length > 0 ? (
              <TextField
                select
                label={floorSetupRequiredLabel(wizardCopy.sectionName)}
                value={sectionId}
                onChange={(event) => handleSectionChange(event.target.value)}
                fullWidth
                required
                sx={floorSetupFieldSx}
              >
                {sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
                <MenuItem value={NEW_TABLE_SECTION_ID}>{wizardCopy.addNewSection}</MenuItem>
              </TextField>
            ) : null}

            {creatingSection ? (
              <>
                <TextField
                  label={floorSetupRequiredLabel(wizardCopy.newSectionName)}
                  value={sectionName}
                  placeholder={wizardCopy.sectionNamePlaceholder}
                  onChange={(event) => setSectionName(event.target.value)}
                  required
                  fullWidth
                  sx={floorSetupFieldSx}
                />
                <TextField
                  label={wizardCopy.sectionCode}
                  value={sectionCode}
                  placeholder={wizardCopy.sectionCodePlaceholder}
                  onChange={(event) => setSectionCode(event.target.value)}
                  helperText={wizardCopy.sectionCodeHint}
                  fullWidth
                  sx={floorSetupFieldSx}
                />
              </>
            ) : null}

            <TextField
              label={floorSetupRequiredLabel(wizardCopy.startNumber)}
              value={startNumber}
              onChange={(event) => {
                setStartTouched(true);
                setStartNumber(event.target.value);
              }}
              fullWidth
              required
              sx={floorSetupFieldSx}
            />

            {mode === 'bulk' ? (
              <TextField
                label={floorSetupRequiredLabel(wizardCopy.numberOfTables)}
                type="number"
                value={count}
                onChange={(event) => setCount(event.target.value)}
                fullWidth
                required
                slotProps={{ htmlInput: { min: 1 } }}
                sx={floorSetupFieldSx}
              />
            ) : null}

            <TextField
              select
              label={floorSetupRequiredLabel(wizardCopy.capacity)}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              fullWidth
              required
              sx={floorSetupFieldSx}
            >
              {tableCapacityOptions.map((option) => (
                <MenuItem key={option} value={String(option)}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            {mode === 'bulk' && previewNumbers.length > 0 ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  {wizardCopy.preview}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                  }}
                >
                  {previewNumbers.map((number) => (
                    <Chip key={number} label={number} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            ) : null}

            {!rangeValidation.ok ? <Alert severity="error">{rangeValidation.message}</Alert> : null}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {wizardCopy.reservations}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {wizardCopy.reservationsHint}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={reservations}
                    onChange={(event) => setReservations(event.target.checked)}
                    color="primary"
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, width: isCompactLayout ? '100%' : undefined }}>
          {isCompactLayout ? (
            <FloorSetupCompactStickyFooter back={cancelButton} primary={submitButton} />
          ) : (
            <>
              {cancelButton}
              {submitButton}
            </>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}

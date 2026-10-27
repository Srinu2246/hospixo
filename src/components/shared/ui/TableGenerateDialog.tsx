'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { CalendarDays } from 'lucide-react';

import { LabeledDropdown } from '@/components/features/floor-and-table-setup/SetupFields';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import type {
  TableBulkEditInput,
  TableGenerateInput,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { screen } from '@/lib/theme/mui/breakpoints';

const capacityOptions = [1, 2, 4, 6, 8, 10, 12] as const;

const statusOptions = [
  {
    id: 'active',
    label: 'Active',
    icon: <StatusDot color="success.main" />,
  },
  {
    id: 'inactive',
    label: 'Inactive',
    icon: <StatusDot color="error.main" />,
  },
] as const;

export type TableDialogMode = 'create' | 'bulk' | 'bulk-edit';

export interface TableGenerateDialogProps {
  open: boolean;
  mode: TableDialogMode;
  start: string;
  end?: string;
  saving?: boolean;
  sections?: readonly { id: string; name: string }[];
  onClose: () => void;
  onGenerate?: (input: TableGenerateInput, sectionId?: string) => void;
  onBulkEdit?: (input: TableBulkEditInput, sectionId?: string) => void;
}

export function TableGenerateDialog({
  open,
  mode,
  start,
  end,
  saving = false,
  sections,
  onClose,
  onGenerate,
  onBulkEdit,
}: Readonly<TableGenerateDialogProps>) {
  const title =
    mode === 'bulk-edit'
      ? 'Bulk Edit Tables'
      : mode === 'bulk'
        ? 'Bulk Generate Tables'
        : 'Create Table';
  const subtitle = mode === 'create' ? undefined : 'Generate multiple sequential tables at once';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      width={520}
      height="auto"
    >
      {open ? (
        <TableGenerateForm
          key={`${mode}-${start}-${end ?? ''}`}
          mode={mode}
          start={start}
          end={end}
          saving={saving}
          sections={sections}
          onClose={onClose}
          onGenerate={onGenerate}
          onBulkEdit={onBulkEdit}
        />
      ) : null}
    </Modal>
  );
}

function TableGenerateForm({
  mode,
  start,
  end,
  saving,
  sections,
  onClose,
  onGenerate,
  onBulkEdit,
}: Readonly<{
  mode: TableDialogMode;
  start: string;
  end?: string;
  saving: boolean;
  sections?: readonly { id: string; name: string }[];
  onClose: () => void;
  onGenerate?: (input: TableGenerateInput, sectionId?: string) => void;
  onBulkEdit?: (input: TableBulkEditInput, sectionId?: string) => void;
}>) {
  const [draft, setDraft] = useState<TableGenerateInput>({
    start,
    count: mode === 'bulk' ? 25 : 1,
    seats: 4,
    reservations: true,
  });
  const [rangeEnd, setRangeEnd] = useState(end || start);
  const [active, setActive] = useState(true);
  const [sectionId, setSectionId] = useState(sections?.[0]?.id ?? '');
  const showSection = (sections?.length ?? 0) > 1;
  const canSubmit =
    draft.start.trim().length > 0 &&
    draft.seats >= 1 &&
    (mode !== 'bulk' || draft.count >= 1) &&
    (mode !== 'bulk-edit' || rangeEnd.trim().length > 0) &&
    (sections === undefined || sectionId.length > 0);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit || saving) return;
        if (mode === 'bulk-edit') {
          onBulkEdit?.(
            {
              start: draft.start.trim(),
              end: rangeEnd.trim(),
              seats: draft.seats,
              active,
              reservations: draft.reservations,
            },
            sectionId || undefined,
          );
          return;
        }
        onGenerate?.(
          { ...draft, start: draft.start.trim(), count: mode === 'create' ? 1 : draft.count },
          sectionId || undefined,
        );
      }}
    >
      {showSection ? (
        <LabeledDropdown
          label="Section"
          options={(sections ?? []).map((section) => ({ id: section.id, label: section.name }))}
          value={sectionId}
          onChange={setSectionId}
        />
      ) : null}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.tablet]: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Input
          id="table-start"
          label={mode === 'bulk-edit' ? 'Start Table Number' : 'Start Number'}
          value={draft.start}
          onChange={(event) => setDraft({ ...draft, start: event.target.value })}
        />
        {mode === 'create' ? (
          <LabeledDropdown
            label="Capacity"
            options={capacityOptions.map((seats) => ({ id: seats, label: String(seats) }))}
            value={draft.seats}
            onChange={(seats) => setDraft({ ...draft, seats })}
          />
        ) : null}
        {mode === 'bulk' ? (
          <Input
            id="table-count"
            label="Count"
            value={String(draft.count)}
            onChange={(event) =>
              setDraft({ ...draft, count: Number(event.target.value.replace(/[^\d]/g, '')) || 0 })
            }
          />
        ) : null}
        {mode === 'bulk-edit' ? (
          <Input
            id="table-end"
            label="End Table Number"
            value={rangeEnd}
            onChange={(event) => setRangeEnd(event.target.value)}
          />
        ) : null}
      </Box>
      {mode !== 'create' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              [screen.mobile]: '1fr',
              [screen.tablet]: mode === 'bulk-edit' ? '1fr 1fr' : '1fr',
            },
            gap: 2,
          }}
        >
          <LabeledDropdown
            label="Capacity"
            options={capacityOptions.map((seats) => ({ id: seats, label: String(seats) }))}
            value={draft.seats}
            onChange={(seats) => setDraft({ ...draft, seats })}
          />
          {mode === 'bulk-edit' ? (
            <LabeledDropdown
              label="Status"
              options={statusOptions}
              value={active ? 'active' : 'inactive'}
              onChange={(value) => setActive(value === 'active')}
            />
          ) : null}
        </Box>
      ) : null}
      <TableReservationsField
        checked={draft.reservations}
        onChange={(reservations) => setDraft({ ...draft, reservations })}
      />
      <Stack
        direction={{ [screen.mobile]: 'column-reverse', [screen.tablet]: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end', pt: 0.5 }}
      >
        <ActionButton
          variant="outlined"
          type="button"
          onClick={onClose}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Cancel
        </ActionButton>
        <ActionButton
          type="submit"
          disabled={!canSubmit || saving}
          loading={saving}
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          {mode === 'bulk-edit' ? 'Update' : 'Generate'}
        </ActionButton>
      </Stack>
    </Stack>
  );
}

export function TableReservationsField({
  checked,
  onChange,
  showTitle = true,
}: Readonly<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  showTitle?: boolean;
}>) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <CalendarDays size={16} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {showTitle ? (
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Reservations</Typography>
          ) : null}
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.45 }}>
            Set permissions for accepting and managing reservations
          </Typography>
        </Box>
        <Switch
          checked={checked}
          onChange={(_event, next) => onChange(next)}
          color="primary"
          sx={{ flexShrink: 0 }}
        />
      </Stack>
    </Box>
  );
}

function StatusDot({ color }: Readonly<{ color: string }>) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: color,
      }}
    />
  );
}

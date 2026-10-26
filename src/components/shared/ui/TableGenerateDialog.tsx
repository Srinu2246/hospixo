'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { LabeledDropdown } from '@/components/features/floor-and-table-setup/SetupFields';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { Modal } from '@/components/shared/ui/Modal';
import type { TableGenerateInput } from '@/features/management/floor-and-table-setup/types/floorSetup';
import { screen } from '@/lib/theme/mui/breakpoints';

const capacityOptions = [1, 2, 4, 6, 8, 10, 12] as const;

export interface TableGenerateDialogProps {
  open: boolean;
  bulk: boolean;
  start: string;
  onClose: () => void;
  onGenerate: (input: TableGenerateInput) => void;
}

export function TableGenerateDialog({
  open,
  bulk,
  start,
  onClose,
  onGenerate,
}: Readonly<TableGenerateDialogProps>) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bulk ? 'Bulk Generate Tables' : 'Create Table'}
      width={560}
      height="auto"
    >
      {open ? (
        <TableGenerateForm bulk={bulk} start={start} onClose={onClose} onGenerate={onGenerate} />
      ) : null}
    </Modal>
  );
}

function TableGenerateForm({
  bulk,
  start,
  onClose,
  onGenerate,
}: Readonly<{
  bulk: boolean;
  start: string;
  onClose: () => void;
  onGenerate: (input: TableGenerateInput) => void;
}>) {
  const [draft, setDraft] = useState<TableGenerateInput>({
    start,
    count: bulk ? 10 : 1,
    seats: 4,
    reservations: true,
  });

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate(draft);
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.tablet]: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Input
          id="table-start"
          label="Start Number"
          value={draft.start}
          onChange={(event) => setDraft({ ...draft, start: event.target.value })}
        />
        <LabeledDropdown
          label="Capacity"
          options={capacityOptions.map((seats) => ({ id: seats, label: String(seats) }))}
          value={draft.seats}
          onChange={(value) => setDraft({ ...draft, seats: value })}
        />
      </Box>
      {bulk ? (
        <Input
          id="table-count"
          label="Number of Tables"
          type="number"
          value={String(draft.count)}
          onChange={(event) => setDraft({ ...draft, count: Number(event.target.value) })}
        />
      ) : null}
      <Box
        sx={{
          p: 1.5,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <LabeledSwitch
          title="Reservations"
          hint="Set permissions for accepting and managing reservations"
          checked={draft.reservations}
          onChange={(reservations) => setDraft({ ...draft, reservations })}
        />
      </Box>
      <Stack
        direction={{ [screen.mobile]: 'column-reverse', [screen.tablet]: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
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
          sx={{ width: { [screen.mobile]: '100%', [screen.tablet]: 'auto' } }}
        >
          Generate
        </ActionButton>
      </Stack>
    </Stack>
  );
}

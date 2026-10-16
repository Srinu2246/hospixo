'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarDays } from 'lucide-react';

import { StatusRow } from '@/components/features/floor-and-table-setup/SetupFields';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import type {
  CatalogSection,
  CatalogTable,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { screen } from '@/lib/theme/mui/breakpoints';

const statusOptions = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export function EditTableDialog({
  table,
  sections,
  saving,
  lockSection = false,
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable | null;
  sections: readonly CatalogSection[];
  saving: boolean;
  /** When true, section cannot be changed (used from section overview). */
  lockSection?: boolean;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
  return (
    <Modal
      open={table !== null}
      onClose={onClose}
      title={table && !isPersistedId(table.id) ? 'Add Table' : 'Edit Table'}
      width={440}
      height="auto"
    >
      {table ? (
        <EditTableForm
          key={`${table.id}-${table.seats}-${table.version ?? 0}-${table.sectionId}`}
          table={table}
          sections={sections}
          saving={saving}
          lockSection={lockSection}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Modal>
  );
}

function EditTableForm({
  table,
  sections,
  saving,
  lockSection,
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable;
  sections: readonly CatalogSection[];
  saving: boolean;
  lockSection: boolean;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
  const [draft, setDraft] = useState(table);
  const lockedSection = sections.find((item) => item.id === draft.sectionId);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <Input
        id="edit-table-number"
        label="Table Number"
        value={draft.number}
        onChange={(event) => setDraft({ ...draft, number: event.target.value })}
      />
      <Input
        id="edit-table-capacity"
        label="Capacity"
        value={`${draft.seats} Seats`}
        onChange={(event) => {
          const seats = Number(event.target.value.replace(/[^\d]/g, ''));
          setDraft({ ...draft, seats: Number.isFinite(seats) && seats > 0 ? seats : draft.seats });
        }}
      />
      <Stack spacing={0.75}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Section</Typography>
        {lockSection ? (
          <Typography sx={{ fontWeight: 700 }}>{lockedSection?.name ?? draft.area}</Typography>
        ) : (
          <Dropdown
            options={sections.map((section) => ({ id: section.id, label: section.name }))}
            value={draft.sectionId}
            onChange={(sectionId) => {
              const section = sections.find((item) => item.id === sectionId);
              setDraft({ ...draft, sectionId, area: section?.name ?? draft.area });
            }}
            minWidth="100%"
            sx={{ width: '100%' }}
          />
        )}
      </Stack>
      <Stack spacing={0.75}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Status</Typography>
        <Dropdown
          options={statusOptions}
          value={draft.active ? 'active' : 'inactive'}
          onChange={(value) => setDraft({ ...draft, active: value === 'active' })}
          minWidth="100%"
          sx={{ width: '100%' }}
        />
      </Stack>
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
          }}
        >
          <CalendarDays size={16} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatusRow
            title="Reservations"
            hint="Set permissions for accepting and managing reservations"
            checked={draft.reservations}
            onChange={(reservations) => setDraft({ ...draft, reservations })}
          />
        </Box>
      </Stack>
      <Stack
        direction={{ [screen.mobile]: 'column-reverse', [screen.tablet]: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <ActionButton variant="outlined" type="button" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" disabled={saving || !draft.number.trim() || !draft.sectionId}>
          {!isPersistedId(draft.id) ? 'Create Table' : 'Save Changes'}
        </ActionButton>
      </Stack>
    </Stack>
  );
}

export function nextTableNames(tables: readonly CatalogTable[], count: number): string[] {
  const used = new Set(tables.map((table) => table.number.trim().toLowerCase()));
  const names: string[] = [];
  let serial = 1;
  while (names.length < count) {
    const candidate = `T${String(serial).padStart(3, '0')}`;
    serial += 1;
    if (used.has(candidate.toLowerCase())) continue;
    used.add(candidate.toLowerCase());
    names.push(candidate);
  }
  return names;
}

export function isPersistedId(value: string | undefined): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

export function numericId(value: string | undefined): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

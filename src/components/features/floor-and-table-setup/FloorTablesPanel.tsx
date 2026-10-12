'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarDays, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import { screen } from '@/lib/theme/mui/breakpoints';
import { StatusRow } from '@/components/features/floor-and-table-setup/SetupFields';
import type {
  CatalogSection,
  CatalogTable,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

const statusOptions = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export function FloorTablesPanel({
  tables,
  sections,
  onChange,
}: Readonly<{
  tables: readonly CatalogTable[];
  sections: readonly CatalogSection[];
  onChange: (tables: CatalogTable[]) => void;
}>) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<CatalogTable | null>(null);
  const needle = query.trim().toLowerCase();
  const visible = tables.filter((item) => !needle || item.number.toLowerCase().includes(needle));

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ [screen.mobile]: 'column', [screen.desktop]: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { [screen.desktop]: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800 }}>Tables List</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Manage and view configuration of layout tables
          </Typography>
        </Box>
        <ActionButton
          startIcon={<Plus size={16} />}
          onClick={() =>
            setEditing({
              id: `t-${Date.now()}`,
              number: 'T001',
              seats: 4,
              active: true,
              reservations: true,
              sectionId: sections[0]?.id ?? '',
              area: sections[0]?.name ?? '',
              shape: 'Square',
            })
          }
          sx={{ width: { [screen.mobile]: '100%', [screen.desktop]: 'auto' } }}
        >
          Add Table
        </ActionButton>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ flex: '1 1 0', minWidth: 0, maxWidth: { [screen.desktop]: 280 } }}>
          <Input
            id="catalog-table-search"
            fullWidth
            placeholder="Search tables..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            startIcon={<Search size={16} />}
          />
        </Box>
        <ActionButton
          variant="outlined"
          size="small"
          sx={{ flexShrink: 0, px: { [screen.mobile]: 1.25, [screen.desktop]: 2 } }}
        >
          Bulk Edit
        </ActionButton>
        <ActionButton
          variant="outlined"
          size="small"
          sx={{ flexShrink: 0, px: { [screen.mobile]: 1.25, [screen.desktop]: 2 } }}
        >
          Bulk Generate
        </ActionButton>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            [screen.mobile]: 'repeat(2, minmax(0, 1fr))',
            [screen.tablet]: 'repeat(3, minmax(0, 1fr))',
            [screen.desktop]: 'repeat(4, minmax(0, 1fr))',
            [screen.wide]: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {visible.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 0.5, minWidth: 0 }}
            >
              <Typography sx={{ fontWeight: 800 }}>{item.number}</Typography>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.active ? 'success.main' : 'error.main',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: item.active ? 'success.main' : 'error.main',
                  }}
                >
                  {item.active ? 'Active' : 'Inactive'}
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}
            >
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                {item.seats} {item.seats === 1 ? 'Seat' : 'Seats'}
              </Typography>
              <Stack direction="row">
                <ActionButton
                  variant="icon"
                  size="small"
                  ariaLabel={`Edit ${item.number}`}
                  onClick={() => setEditing(item)}
                >
                  <Pencil size={15} />
                </ActionButton>
                <ActionButton
                  variant="icon"
                  size="small"
                  ariaLabel={`Delete ${item.number}`}
                  onClick={() => onChange(tables.filter((table) => table.id !== item.id))}
                >
                  <Trash2 size={15} />
                </ActionButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>

      <EditTableDialog
        table={editing}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          const exists = tables.some((item) => item.id === next.id);
          onChange(
            exists ? tables.map((item) => (item.id === next.id ? next : item)) : [...tables, next],
          );
          setEditing(null);
        }}
      />
    </Stack>
  );
}

function EditTableDialog({
  table,
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable | null;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
  return (
    <Modal open={table !== null} onClose={onClose} title="Edit Table" width={440} height="auto">
      {table ? <EditTableForm table={table} onClose={onClose} onSave={onSave} /> : null}
    </Modal>
  );
}

function EditTableForm({
  table,
  onClose,
  onSave,
}: Readonly<{ table: CatalogTable; onClose: () => void; onSave: (table: CatalogTable) => void }>) {
  const [draft, setDraft] = useState(table);

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
        <ActionButton type="submit">Generate</ActionButton>
      </Stack>
    </Stack>
  );
}

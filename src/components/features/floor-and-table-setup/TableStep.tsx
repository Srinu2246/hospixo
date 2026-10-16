'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LayoutGrid, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import {
  LabeledDropdown,
  StatusRow,
} from '@/components/features/floor-and-table-setup/SetupFields';
import {
  compactFilterDropdownSx,
  compactMuiSpacing,
  tableToolbarActionsGridSx,
} from '@/components/features/floor-and-table-setup/compactLayoutSx';
import { screen } from '@/lib/theme/mui/breakpoints';
import { filterTables, nextTableStart } from '@/lib/helpers/floorAndTableSetup';
import type {
  TableDraft,
  TableGenerateInput,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

const capacityOptions = [1, 2, 4, 6, 8, 10, 12] as const;

type TableStatusFilter = 'all' | 'active' | 'inactive';

const tableStatusOptions = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export function TableStep({
  tables,
  onGenerate,
  onDelete,
  onToggleActive,
  onBulkEdit,
}: Readonly<{
  tables: readonly TableDraft[];
  onGenerate: (input: TableGenerateInput) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onBulkEdit: () => void;
}>) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TableStatusFilter>('all');
  const [dialog, setDialog] = useState<'single' | 'bulk' | null>(null);
  const visible = filterTables(tables, query).filter((table) => {
    if (status === 'active') return table.active;
    if (status === 'inactive') return !table.active;
    return true;
  });

  return (
    <Stack spacing={{ xs: compactMuiSpacing.block, md: 2 }}>
      <Stack spacing={compactMuiSpacing.block} sx={{ display: { xs: 'flex', md: 'none' } }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>Tables List</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
              View and manage layout tables.
            </Typography>
          </Box>
          <ActionButton
            startIcon={<Plus size={16} />}
            onClick={() => setDialog('single')}
            sx={{ flexShrink: 0, height: 44, whiteSpace: 'nowrap' }}
          >
            Add Table
          </ActionButton>
        </Stack>
        <Input
          id="table-search-mobile"
          fullWidth
          placeholder="Search tables..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          startIcon={<Search size={16} />}
        />
        <Box sx={tableToolbarActionsGridSx}>
          <Dropdown
            placeholder="Status"
            options={tableStatusOptions}
            value={status}
            onChange={setStatus}
            size="large"
            minWidth={0}
            sx={compactFilterDropdownSx}
          />
          <ActionButton variant="outlined" onClick={onBulkEdit}>
            Bulk Edit
          </ActionButton>
          <ActionButton variant="outlined" onClick={() => setDialog('bulk')}>
            Bulk Generate
          </ActionButton>
        </Box>
      </Stack>

      <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>Tables List</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Manage and view configuration of layout tables
            </Typography>
          </Box>
          <ActionButton startIcon={<Plus size={16} />} onClick={() => setDialog('single')}>
            Add Table
          </ActionButton>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1, width: '100%', maxWidth: 320 }}>
            <Input
              id="table-search"
              placeholder="Search tables..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              startIcon={<Search size={16} />}
            />
          </Box>
          <ActionButton variant="outlined" onClick={onBulkEdit}>
            Bulk Edit
          </ActionButton>
          <ActionButton variant="outlined" onClick={() => setDialog('bulk')}>
            Bulk Generate
          </ActionButton>
        </Stack>
      </Stack>

      {tables.length === 0 ? (
        <Box
          sx={{
            minHeight: { [screen.mobile]: 280, [screen.desktop]: 420 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            bgcolor: 'background.paper',
            display: 'grid',
            placeItems: 'center',
            px: 2,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
            <Box
              sx={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'rgba(51, 84, 244, 0.12)',
                color: 'primary.main',
              }}
            >
              <LayoutGrid size={30} />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { [screen.mobile]: '1.15rem', [screen.desktop]: '1.35rem' },
              }}
            >
              No Tables Yet
            </Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Get started by adding your first table to manage seating, layouts, and guest orders
              efficiently.
            </Typography>
            <ActionButton startIcon={<Plus size={16} />} onClick={() => setDialog('single')}>
              Add Your First Table
            </ActionButton>
          </Stack>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              [screen.mobile]: 'repeat(2, minmax(0, 1fr))',
              [screen.tablet]: 'repeat(3, minmax(0, 1fr))',
              [screen.desktop]: 'repeat(3, 1fr)',
              [screen.wide]: 'repeat(5, 1fr)',
            },
            gap: 1.5,
          }}
        >
          {visible.map((table) => (
            <Box
              key={table.id}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {table.number}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: table.active ? 'success.main' : 'error.main',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: table.active ? 'success.main' : 'error.main',
                    }}
                  >
                    {table.active ? 'Active' : 'Inactive'}
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1 }}
              >
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                  {table.seats} {table.seats === 1 ? 'Seat' : 'Seats'}
                </Typography>
                <Stack direction="row">
                  <ActionButton
                    variant="icon"
                    size="small"
                    ariaLabel="Edit table"
                    onClick={() => onToggleActive(table.id)}
                  >
                    <Pencil size={15} />
                  </ActionButton>
                  <ActionButton
                    variant="icon"
                    size="small"
                    ariaLabel="Delete table"
                    onClick={() => onDelete(table.id)}
                  >
                    <Trash2 size={15} />
                  </ActionButton>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Box>
      )}

      <TableDialog
        open={dialog !== null}
        bulk={dialog === 'bulk'}
        start={nextTableStart(tables)}
        onClose={() => setDialog(null)}
        onGenerate={(input) => {
          onGenerate(input);
          setDialog(null);
        }}
      />
    </Stack>
  );
}

function TableDialog({
  open,
  bulk,
  start,
  onClose,
  onGenerate,
}: Readonly<{
  open: boolean;
  bulk: boolean;
  start: string;
  onClose: () => void;
  onGenerate: (input: TableGenerateInput) => void;
}>) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bulk ? 'Bulk Generate Tables' : 'Create Table'}
      width={560}
      height="auto"
    >
      {open ? (
        <TableForm bulk={bulk} start={start} onClose={onClose} onGenerate={onGenerate} />
      ) : null}
    </Modal>
  );
}

function TableForm({
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
        <StatusRow
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

'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarDays, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import {
  useArchiveTable,
  useBulkCreateTables,
  useBulkUpdateTables,
  useCreateTable,
  useMoveTable,
  useRestoreTable,
  useTable,
  useUpdateTable,
} from '@/lib/hooks/floor-and-table-setup/useRestaurantFloors';
import { toCatalogTable } from '@/lib/schemas/floor-and-table-setup/floors';
import { ApiError } from '@/services/api/types';
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
  branchId,
  floorId,
}: Readonly<{
  tables: readonly CatalogTable[];
  sections: readonly CatalogSection[];
  branchId?: number;
  floorId?: number;
}>) {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<CatalogTable | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const createTable = useCreateTable(branchId);
  const updateTable = useUpdateTable(branchId);
  const bulkCreateTables = useBulkCreateTables(branchId);
  const bulkUpdateTables = useBulkUpdateTables(branchId);
  const moveTable = useMoveTable(branchId);
  const archiveTable = useArchiveTable(branchId);
  const restoreTable = useRestoreTable(branchId);
  const editingSectionId = numericId(editing?.sectionId);
  const editingTableId = numericId(editing?.id);
  const tableQuery = useTable(branchId, floorId, editingSectionId, editingTableId);
  const editingTable = tableQuery.data
    ? toCatalogTable(tableQuery.data, editing?.area ?? '')
    : editing;
  const needle = query.trim().toLowerCase();
  const visible = tables.filter((item) => !needle || item.number.toLowerCase().includes(needle));
  const saving =
    createTable.isPending ||
    updateTable.isPending ||
    bulkCreateTables.isPending ||
    bulkUpdateTables.isPending ||
    moveTable.isPending ||
    archiveTable.isPending ||
    restoreTable.isPending;

  async function saveTable(next: CatalogTable) {
    if (floorId == null) return;
    const sectionId = numericId(next.sectionId);
    if (sectionId == null) {
      setActionError('Choose a section for this table.');
      return;
    }
    setActionError(null);
    try {
      const tableId = numericId(next.id);
      if (tableId == null) {
        await createTable.mutateAsync({
          floorId,
          sectionId,
          body: {
            name: next.number.trim(),
            description: next.description ?? '',
            capacity: next.seats,
            sort_order: next.sortOrder ?? tables.length,
          },
        });
        setEditing(null);
        return;
      }
      const original = tables.find((item) => item.id === next.id);
      const originalSectionId = numericId(original?.sectionId) ?? sectionId;
      let version = next.version ?? 0;
      if (original && original.active !== next.active) {
        const changed = next.active
          ? await restoreTable.mutateAsync({
              floorId,
              sectionId: originalSectionId,
              tableId,
              body: { reason: 'Restored', version },
            })
          : await archiveTable.mutateAsync({
              floorId,
              sectionId: originalSectionId,
              tableId,
              body: { reason: 'Inactive', version },
            });
        version = changed.version ?? version;
      }
      if (originalSectionId !== sectionId) {
        const moved = await moveTable.mutateAsync({
          floorId,
          sectionId: originalSectionId,
          tableId,
          body: { floor_id: floorId, section_id: sectionId, version },
        });
        version = moved.version ?? version;
      }
      await updateTable.mutateAsync({
        floorId,
        sectionId,
        tableId,
        body: {
          name: next.number.trim(),
          description: next.description ?? '',
          capacity: next.seats,
          sort_order: next.sortOrder ?? 0,
          status: next.active ? 'active' : 'inactive',
          version,
        },
      });
      setEditing(null);
    } catch (error) {
      setActionError(tableError(error, 'Could not save this table.'));
    }
  }

  async function archiveById(table: CatalogTable) {
    const sectionId = numericId(table.sectionId);
    const tableId = numericId(table.id);
    if (floorId == null || sectionId == null || tableId == null) return;
    setActionError(null);
    try {
      await archiveTable.mutateAsync({
        floorId,
        sectionId,
        tableId,
        body: { reason: 'Archived', version: table.version ?? 0 },
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not archive this table.');
    }
  }

  async function bulkEdit() {
    if (floorId == null) return;
    const groups = new Map<number, CatalogTable[]>();
    for (const table of tables) {
      const sectionId = numericId(table.sectionId);
      if (numericId(table.id) == null || sectionId == null) continue;
      groups.set(sectionId, [...(groups.get(sectionId) ?? []), table]);
    }
    setActionError(null);
    try {
      for (const [sectionId, group] of groups) {
        await bulkUpdateTables.mutateAsync({
          floorId,
          sectionId,
          body: {
            items: group.map((table) => ({
              table_id: Number(table.id),
              name: table.number,
              description: table.description ?? '',
              capacity: table.seats,
              sort_order: table.sortOrder ?? 0,
              status: table.active ? 'inactive' : 'active',
              version: table.version ?? 0,
            })),
          },
        });
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not update these tables.');
    }
  }

  async function bulkGenerate(sectionId: number, count: number, seats: number) {
    if (floorId == null || count < 1) return;
    setActionError(null);
    try {
      await bulkCreateTables.mutateAsync({
        floorId,
        sectionId,
        body: {
          items: nextTableNames(tables, count).map((name, index) => ({
            name,
            description: '',
            capacity: seats,
            sort_order: tables.length + index,
          })),
        },
      });
      setBulkOpen(false);
    } catch (error) {
      setActionError(tableError(error, 'Could not create these tables.'));
    }
  }

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
              number: nextTableNames(tables, 1)[0] ?? 'T001',
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
          disabled={saving || tables.length === 0}
          onClick={() => {
            void bulkEdit();
          }}
          sx={{ flexShrink: 0, px: { [screen.mobile]: 1.25, [screen.desktop]: 2 } }}
        >
          Bulk Edit
        </ActionButton>
        <ActionButton
          variant="outlined"
          size="small"
          disabled={saving || sections.length === 0}
          onClick={() => setBulkOpen(true)}
          sx={{ flexShrink: 0, px: { [screen.mobile]: 1.25, [screen.desktop]: 2 } }}
        >
          Bulk Generate
        </ActionButton>
      </Stack>

      {actionError ? <Alert severity="error">{actionError}</Alert> : null}
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
        {visible.length === 0 ? (
          <Typography
            sx={{ color: 'text.secondary', gridColumn: '1 / -1', py: 4, textAlign: 'center' }}
          >
            No tables on this floor.
          </Typography>
        ) : null}
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
                  onClick={() => {
                    void archiveById(item);
                  }}
                >
                  <Trash2 size={15} />
                </ActionButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>

      <EditTableDialog
        table={editingTable}
        sections={sections}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          void saveTable(next);
        }}
      />
      {bulkOpen ? (
        <BulkGenerateDialog
          sections={sections}
          saving={saving}
          onClose={() => setBulkOpen(false)}
          onCreate={(sectionId, count, seats) => {
            void bulkGenerate(sectionId, count, seats);
          }}
        />
      ) : null}
    </Stack>
  );
}

function numericId(value: string | undefined): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

function nextTableNames(tables: readonly CatalogTable[], count: number): string[] {
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

function tableError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 409) {
    return 'That table number is already used in this branch. Choose a different name.';
  }
  return error instanceof Error ? error.message : fallback;
}

function EditTableDialog({
  table,
  sections,
  saving,
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable | null;
  sections: readonly CatalogSection[];
  saving: boolean;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
  return (
    <Modal
      open={table !== null}
      onClose={onClose}
      title={table && numericId(table.id) == null ? 'Add Table' : 'Edit Table'}
      width={440}
      height="auto"
    >
      {table ? (
        <EditTableForm
          key={`${table.id}-${table.seats}-${table.version ?? 0}-${table.sectionId}`}
          table={table}
          sections={sections}
          saving={saving}
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
  onClose,
  onSave,
}: Readonly<{
  table: CatalogTable;
  sections: readonly CatalogSection[];
  saving: boolean;
  onClose: () => void;
  onSave: (table: CatalogTable) => void;
}>) {
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
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Section</Typography>
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
          {numericId(draft.id) == null ? 'Create Table' : 'Save Changes'}
        </ActionButton>
      </Stack>
    </Stack>
  );
}

function BulkGenerateDialog({
  sections,
  saving,
  onClose,
  onCreate,
}: Readonly<{
  sections: readonly CatalogSection[];
  saving: boolean;
  onClose: () => void;
  onCreate: (sectionId: number, count: number, seats: number) => void;
}>) {
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '');
  const [count, setCount] = useState('4');
  const [seats, setSeats] = useState('4');
  const parsedCount = Number(count);
  const parsedSeats = Number(seats);

  return (
    <Modal open onClose={onClose} title="Bulk Generate" width={440} height="auto">
      <Stack
        component="form"
        spacing={2}
        onSubmit={(event) => {
          event.preventDefault();
          const id = numericId(sectionId);
          if (id == null || parsedCount < 1 || parsedSeats < 1) return;
          onCreate(id, parsedCount, parsedSeats);
        }}
      >
        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Section</Typography>
          <Dropdown
            options={sections.map((section) => ({ id: section.id, label: section.name }))}
            value={sectionId}
            onChange={setSectionId}
            minWidth="100%"
            sx={{ width: '100%' }}
          />
        </Stack>
        <Input
          id="bulk-table-count"
          label="Number of tables"
          value={count}
          onChange={(event) => setCount(event.target.value.replace(/[^\d]/g, ''))}
        />
        <Input
          id="bulk-table-seats"
          label="Seats per table"
          value={seats}
          onChange={(event) => setSeats(event.target.value.replace(/[^\d]/g, ''))}
        />
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <ActionButton variant="outlined" type="button" onClick={onClose}>
            Cancel
          </ActionButton>
          <ActionButton
            type="submit"
            disabled={saving || numericId(sectionId) == null || parsedCount < 1 || parsedSeats < 1}
          >
            Generate
          </ActionButton>
        </Stack>
      </Stack>
    </Modal>
  );
}

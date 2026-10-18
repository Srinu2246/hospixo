'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';

import {
  EditTableDialog,
  nextTableNames,
  numericId,
} from '@/components/features/floor-and-table-setup/EditTableDialog';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Modal } from '@/components/shared/ui/Modal';
import {
  ACTIVE_STATUS_FILTER_OPTIONS,
  type ActiveStatusFilter,
  type CatalogSection,
  type CatalogTable,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
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
import { useToastStore } from '@/stores/toastStore';

const compactFilterDropdownSx = {
  width: '100%',
  height: 44,
  '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const;

const tableToolbarActionsGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 1.25,
  width: '100%',
  alignItems: 'stretch',
  '& > .MuiFormControl-root': { minWidth: 0 },
  '& .MuiButton-root': { minHeight: 44, width: '100%' },
} as const;

export type FloorTablesPanelActions = {
  openAddTable: () => void;
};

export function FloorTablesPanel({
  tables,
  sections,
  branchId,
  floorId,
  onRegisterActions,
}: Readonly<{
  tables: readonly CatalogTable[];
  sections: readonly CatalogSection[];
  branchId?: number;
  floorId?: number;
  onRegisterActions?: (actions: FloorTablesPanelActions) => void;
}>) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ActiveStatusFilter>('all');
  const [editing, setEditing] = useState<CatalogTable | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const showToast = useToastStore((state) => state.show);
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
  const theme = useTheme();
  const belowDesktop = useMediaQuery(theme.breakpoints.down('md'));
  const needle = query.trim().toLowerCase();
  const visible = tables.filter((item) => {
    if (belowDesktop) {
      if (status === 'active' && !item.active) return false;
      if (status === 'inactive' && item.active) return false;
    }
    return !needle || item.number.toLowerCase().includes(needle);
  });
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
      showToast('Choose a section for this table.', 'error');
      return;
    }
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
        showToast(`Table ${next.number.trim()} created successfully.`, 'success');
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
      showToast(`Table ${next.number.trim()} updated successfully.`, 'success');
    } catch (error) {
      showToast(tableError(error, 'Could not save this table.'), 'error');
    }
  }

  async function archiveById(table: CatalogTable) {
    const sectionId = numericId(table.sectionId);
    const tableId = numericId(table.id);
    if (floorId == null || sectionId == null || tableId == null) return;
    try {
      await archiveTable.mutateAsync({
        floorId,
        sectionId,
        tableId,
        body: { reason: 'Archived', version: table.version ?? 0 },
      });
      showToast(`Table ${table.number} archived successfully.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not archive this table.', 'error');
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
      showToast('Tables updated successfully.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update these tables.', 'error');
    }
  }

  async function bulkGenerate(sectionId: number, count: number, seats: number) {
    if (floorId == null || count < 1) return;
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
      showToast(`${count} tables created successfully.`, 'success');
    } catch (error) {
      showToast(tableError(error, 'Could not create these tables.'), 'error');
    }
  }

  function openAddTable() {
    setEditing({
      id: `t-${Date.now()}`,
      number: nextTableNames(tables, 1)[0] ?? 'T001',
      seats: 4,
      active: true,
      reservations: true,
      sectionId: sections[0]?.id ?? '',
      area: sections[0]?.name ?? '',
      shape: 'Square',
    });
  }

  useEffect(() => {
    onRegisterActions?.({ openAddTable });
  });

  return (
    <Stack spacing={{ xs: 2, md: 2 }}>
      <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
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
            onClick={openAddTable}
            sx={{ flexShrink: 0, height: 44, whiteSpace: 'nowrap' }}
          >
            Add Table
          </ActionButton>
        </Stack>
        <Input
          id="catalog-table-search-mobile"
          fullWidth
          placeholder="Search tables..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          startIcon={<Search size={16} />}
        />
        <Box sx={tableToolbarActionsGridSx}>
          <Dropdown
            placeholder="Status"
            options={ACTIVE_STATUS_FILTER_OPTIONS}
            value={status}
            onChange={setStatus}
            size="large"
            minWidth={0}
            sx={compactFilterDropdownSx}
          />
          <ActionButton
            variant="outlined"
            disabled={saving || tables.length === 0}
            onClick={() => {
              void bulkEdit();
            }}
          >
            Bulk Edit
          </ActionButton>
          <ActionButton
            variant="outlined"
            disabled={saving || sections.length === 0}
            onClick={() => setBulkOpen(true)}
          >
            Bulk Generate
          </ActionButton>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800 }}>Tables List</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            Manage and view configuration of layout tables
          </Typography>
        </Box>
        <ActionButton startIcon={<Plus size={16} />} onClick={openAddTable}>
          Add Table
        </ActionButton>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          minWidth: 0,
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <Box sx={{ flex: '1 1 0', minWidth: 0, maxWidth: 280 }}>
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
          size="large"
          disabled={saving || tables.length === 0}
          onClick={() => {
            void bulkEdit();
          }}
          sx={{ flexShrink: 0, height: 44, px: 2 }}
        >
          Bulk Edit
        </ActionButton>
        <ActionButton
          variant="outlined"
          size="large"
          disabled={saving || sections.length === 0}
          onClick={() => setBulkOpen(true)}
          sx={{ flexShrink: 0, height: 44, px: 2 }}
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
        {visible.length === 0 ? (
          <Typography
            sx={{ color: 'text.secondary', gridColumn: '1 / -1', py: 4, textAlign: 'center' }}
          >
            {tables.length === 0 ? 'No tables on this floor.' : 'No tables match this filter.'}
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
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: 'grey.400' },
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
              <Stack direction="row" spacing={0.75}>
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

function tableError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 409) {
    return 'That table number is already used in this branch. Choose a different name.';
  }
  return error instanceof Error ? error.message : fallback;
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

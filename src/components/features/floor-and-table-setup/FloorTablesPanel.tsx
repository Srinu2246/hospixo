'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { DeleteTableModal } from '@/components/features/floor-and-table-setup/DeleteTableModal';
import {
  EditTableDialog,
  numericId,
} from '@/components/features/floor-and-table-setup/EditTableDialog';
import { TablesToolbar } from '@/components/features/floor-and-table-setup/TablesToolbar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { TableGenerateDialog } from '@/components/shared/ui/TableGenerateDialog';
import {
  type ActiveStatusFilter,
  type CatalogSection,
  type CatalogTable,
  type TableBulkEditInput,
  type TableGenerateInput,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  defaultTableRangeEnd,
  generateTables,
  nextTableStart,
  tableNumberInRange,
} from '@/lib/helpers/floorAndTableSetup';
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
import { screen } from '@/lib/theme/mui/breakpoints';
import { useToastStore } from '@/stores/toastStore';

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
  const [sectionId, setSectionId] = useState('all');
  const [editing, setEditing] = useState<CatalogTable | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CatalogTable | null>(null);
  const [dialog, setDialog] = useState<'create' | 'bulk' | 'bulk-edit' | null>(null);
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
  const needle = query.trim().toLowerCase();
  const visible = tables.filter((item) => {
    if (sectionId !== 'all' && item.sectionId !== sectionId) return false;
    if (status === 'active' && !item.active) return false;
    if (status === 'inactive' && item.active) return false;
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
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    }
  }

  async function archiveById(table: CatalogTable) {
    const sectionId = numericId(table.sectionId);
    const tableId = numericId(table.id);
    if (floorId == null || sectionId == null || tableId == null) return false;
    try {
      await archiveTable.mutateAsync({
        floorId,
        sectionId,
        tableId,
        body: { reason: 'Archived', version: table.version ?? 0 },
      });
      return true;
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
      return false;
    }
  }

  async function bulkEdit(input: TableBulkEditInput) {
    if (floorId == null) return;
    const groups = new Map<number, CatalogTable[]>();
    for (const table of tables) {
      const sectionId = numericId(table.sectionId);
      if (numericId(table.id) == null || sectionId == null) continue;
      if (!tableNumberInRange(table.number, input.start, input.end)) continue;
      groups.set(sectionId, [...(groups.get(sectionId) ?? []), table]);
    }
    if (groups.size === 0) {
      showToast('No tables fall in that number range.', 'error');
      return;
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
              capacity: input.seats,
              sort_order: table.sortOrder ?? 0,
              status: input.active ? 'active' : 'inactive',
              version: table.version ?? 0,
            })),
          },
        });
      }
      setDialog(null);
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    }
  }

  async function bulkGenerate(sectionId: number, input: TableGenerateInput) {
    if (floorId == null || input.count < 1) return;
    const created = generateTables(
      input,
      tables.map((table) => ({
        id: table.id,
        number: table.number,
        seats: table.seats,
        active: table.active,
        reservations: table.reservations,
        sectionId: table.sectionId,
      })),
      [],
    );
    if (created.length === 0) return;
    try {
      await bulkCreateTables.mutateAsync({
        floorId,
        sectionId,
        body: {
          items: created.map((table, index) => ({
            name: table.number,
            description: '',
            capacity: table.seats,
            sort_order: tables.length + index,
          })),
        },
      });
      setDialog(null);
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    }
  }

  function openAddTable() {
    setDialog('create');
  }

  useEffect(() => {
    onRegisterActions?.({ openAddTable });
  });

  const tableStart = nextTableStart(
    tables.map((table) => ({
      id: table.id,
      number: table.number,
      seats: table.seats,
      active: table.active,
      reservations: table.reservations,
      sectionId: table.sectionId,
    })),
  );

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

      <TablesToolbar
        searchId="catalog-table-search"
        query={query}
        onQueryChange={setQuery}
        sections={sections}
        sectionId={sectionId}
        onSectionChange={setSectionId}
        status={status}
        onStatusChange={setStatus}
        bulkEditDisabled={saving || tables.length === 0}
        bulkGenerateDisabled={saving || sections.length === 0}
        onBulkEdit={() => setDialog('bulk-edit')}
        onBulkGenerate={() => setDialog('bulk')}
      />

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
                  onClick={() => setPendingDelete(item)}
                >
                  <Trash2 size={15} />
                </ActionButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>

      <DeleteTableModal
        open={pendingDelete !== null}
        tableName={pendingDelete?.number ?? ''}
        loading={archiveTable.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          void archiveById(pendingDelete).then((removed) => {
            if (removed) setPendingDelete(null);
          });
        }}
      />
      <EditTableDialog
        table={editingTable}
        sections={sections}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={(next) => {
          void saveTable(next);
        }}
      />
      <TableGenerateDialog
        open={dialog !== null}
        mode={dialog ?? 'create'}
        start={tableStart}
        end={defaultTableRangeEnd(tableStart)}
        saving={saving}
        sections={sections}
        onClose={() => setDialog(null)}
        onGenerate={(input, sectionId) => {
          const id = numericId(sectionId ?? sections[0]?.id);
          if (id == null) return;
          void bulkGenerate(id, input);
        }}
        onBulkEdit={(input) => {
          void bulkEdit(input);
        }}
      />
    </Stack>
  );
}

'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';

import { DeleteTableModal } from '@/components/features/floor-and-table-setup/DeleteTableModal';
import { TablesToolbar } from '@/components/features/floor-and-table-setup/TablesToolbar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { TableGenerateDialog } from '@/components/shared/ui/TableGenerateDialog';
import { screen } from '@/lib/theme/mui/breakpoints';
import {
  defaultTableRangeEnd,
  filterTables,
  nextTableStart,
} from '@/lib/helpers/floorAndTableSetup';
import {
  type ActiveStatusFilter,
  type TableBulkEditInput,
  type TableDraft,
  type TableGenerateInput,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

export function TableStep({
  tables,
  sections,
  onGenerate,
  onDelete,
  onToggleActive,
  onBulkEdit,
}: Readonly<{
  tables: readonly TableDraft[];
  sections: readonly { id: string; name: string }[];
  onGenerate: (input: TableGenerateInput) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onBulkEdit: (input: TableBulkEditInput) => void;
}>) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ActiveStatusFilter>('all');
  const [sectionId, setSectionId] = useState('all');
  const [dialog, setDialog] = useState<'create' | 'bulk' | 'bulk-edit' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TableDraft | null>(null);
  const visible = filterTables(tables, query).filter((table) => {
    if (sectionId !== 'all' && table.sectionId !== sectionId) return false;
    if (status === 'active') return table.active;
    if (status === 'inactive') return !table.active;
    return true;
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
            onClick={() => setDialog('create')}
            sx={{ flexShrink: 0, height: 44, whiteSpace: 'nowrap' }}
          >
            Add Table
          </ActionButton>
        </Stack>
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
          <ActionButton startIcon={<Plus size={16} />} onClick={() => setDialog('create')}>
            Add Table
          </ActionButton>
        </Stack>
      </Stack>

      <TablesToolbar
        searchId="table-search"
        query={query}
        onQueryChange={setQuery}
        sections={sections}
        sectionId={sectionId}
        onSectionChange={setSectionId}
        status={status}
        onStatusChange={setStatus}
        bulkEditDisabled={tables.length === 0}
        onBulkEdit={() => setDialog('bulk-edit')}
        onBulkGenerate={() => setDialog('bulk')}
      />

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
            <ActionButton startIcon={<Plus size={16} />} onClick={() => setDialog('create')}>
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
                    onClick={() => setPendingDelete(table)}
                  >
                    <Trash2 size={15} />
                  </ActionButton>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Box>
      )}

      <DeleteTableModal
        open={pendingDelete !== null}
        tableName={pendingDelete?.number ?? ''}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
      <TableGenerateDialog
        open={dialog !== null}
        mode={dialog ?? 'create'}
        start={nextTableStart(tables)}
        end={defaultTableRangeEnd(nextTableStart(tables))}
        onClose={() => setDialog(null)}
        onGenerate={(input) => {
          onGenerate(input);
          setDialog(null);
        }}
        onBulkEdit={(input) => {
          onBulkEdit(input);
          setDialog(null);
        }}
      />
    </Stack>
  );
}

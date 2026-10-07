'use client';

import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';

import { UsersListPageSkeleton } from '@/features/user-roles/components/users-list/users-list-page-skeleton';
import { routes } from '@/config/routes';
import { useAuth } from '@/context/auth';
import { floorTableSetupCopy } from '@/features/floor-table-setup/config/copy';
import { FloorFormDialog } from '@/features/floor-table-setup/components/floor-form-dialog';
import { TableFormDialog } from '@/features/floor-table-setup/components/table-form-dialog';
import {
  useFloorTableMutations,
  useFloorTables,
  useFloors,
} from '@/features/floor-table-setup/hooks/use-floor-table-setup';
import type { CreateFloorFormValues } from '@/features/floor-table-setup/schemas/floor-table';
import type { CreateTableFormValues } from '@/features/floor-table-setup/schemas/floor-table';
import type { FloorDto, TableDto } from '@/features/floor-table-setup/types/floor-table';

function StatusChip({ status }: Readonly<{ status: 'active' | 'inactive' }>) {
  return (
    <Chip
      size="small"
      label={status === 'active' ? 'Active' : 'Inactive'}
      color={status === 'active' ? 'success' : 'default'}
      variant="outlined"
    />
  );
}

type FloorTablesPanelProps = Readonly<{
  floor: FloorDto;
  branchId: number | null;
  onAddTable: () => void;
  onEditTable: (table: TableDto) => void;
  onDeleteTable: (table: TableDto) => void;
}>;

function FloorTablesPanel({
  floor,
  branchId,
  onAddTable,
  onEditTable,
  onDeleteTable,
}: FloorTablesPanelProps) {
  const { data, isPending, isError, error } = useFloorTables(floor.id, branchId);
  const tables = data?.items ?? [];

  if (isPending) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading tables…
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ my: 1 }}>
        {error instanceof Error ? error.message : 'Unable to load tables.'}
      </Alert>
    );
  }

  if (tables.length === 0) {
    return (
      <Stack spacing={1.5} sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {floorTableSetupCopy.emptyTables}
        </Typography>
        <Button
          size="small"
          startIcon={<Plus size={16} />}
          onClick={onAddTable}
          sx={{ alignSelf: 'flex-start' }}
        >
          {floorTableSetupCopy.addTable}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ pt: 1 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {tables.length} table{tables.length === 1 ? '' : 's'}
        </Typography>
        <Button size="small" startIcon={<Plus size={16} />} onClick={onAddTable}>
          {floorTableSetupCopy.addTable}
        </Button>
      </Stack>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Seats</TableCell>
              <TableCell>Shape</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tables.map((table) => (
              <TableRow key={table.id} hover>
                <TableCell>{table.name}</TableCell>
                <TableCell align="right">{table.seats}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {table.shape ?? 'square'}
                </TableCell>
                <TableCell>
                  <StatusChip status={table.status} />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label={`Edit ${table.name}`}
                    onClick={() => onEditTable(table)}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={`Delete ${table.name}`}
                    onClick={() => onDeleteTable(table)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

export function FloorTableSetupScreen() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? null;

  const { data, isPending, isError, error, refetch } = useFloors(branchId);
  const mutations = useFloorTableMutations(branchId);

  const floors = data?.items ?? [];

  const [expandedFloorId, setExpandedFloorId] = useState<number | null>(null);
  const [floorDialog, setFloorDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    floor: FloorDto | null;
  }>({ open: false, mode: 'create', floor: null });
  const [tableDialog, setTableDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    floor: FloorDto | null;
    table: TableDto | null;
  }>({ open: false, mode: 'create', floor: null, table: null });
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'floor'; floor: FloorDto } | { type: 'table'; floor: FloorDto; table: TableDto } | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isMutating =
    mutations.createFloor.isPending ||
    mutations.updateFloor.isPending ||
    mutations.deleteFloor.isPending ||
    mutations.createTable.isPending ||
    mutations.updateTable.isPending ||
    mutations.deleteTable.isPending;

  if (isPending) {
    return <UsersListPageSkeleton />;
  }

  if (!branchId) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
        <Alert severity="warning">{floorTableSetupCopy.branchRequired}</Alert>
      </Box>
    );
  }

  async function handleFloorSubmit(values: CreateFloorFormValues) {
    setActionError(null);
    try {
      if (floorDialog.mode === 'create') {
        await mutations.createFloor.mutateAsync(values);
      } else if (floorDialog.floor) {
        await mutations.updateFloor.mutateAsync({
          floorId: floorDialog.floor.id,
          body: values,
        });
      }
      setFloorDialog({ open: false, mode: 'create', floor: null });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save floor.');
    }
  }

  async function handleTableSubmit(values: CreateTableFormValues) {
    if (!tableDialog.floor) return;
    setActionError(null);
    try {
      if (tableDialog.mode === 'create') {
        await mutations.createTable.mutateAsync({
          floorId: tableDialog.floor.id,
          body: values,
        });
      } else if (tableDialog.table) {
        await mutations.updateTable.mutateAsync({
          floorId: tableDialog.floor.id,
          tableId: tableDialog.table.id,
          body: values,
        });
      }
      setTableDialog({ open: false, mode: 'create', floor: null, table: null });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save table.');
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      if (deleteTarget.type === 'floor') {
        await mutations.deleteFloor.mutateAsync(deleteTarget.floor.id);
        if (expandedFloorId === deleteTarget.floor.id) {
          setExpandedFloorId(null);
        }
      } else {
        await mutations.deleteTable.mutateAsync({
          floorId: deleteTarget.floor.id,
          tableId: deleteTarget.table.id,
        });
      }
      setDeleteTarget(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to delete.');
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto', width: '100%' }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-start' },
          }}
        >
          <Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
              {floorTableSetupCopy.listTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
              {floorTableSetupCopy.listSubtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button component={Link} href={routes.dashboard.floorCreate} variant="outlined">
              Full-page create
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setFloorDialog({ open: true, mode: 'create', floor: null })}
            >
              {floorTableSetupCopy.addFloor}
            </Button>
          </Stack>
        </Stack>

        {isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                Retry
              </Button>
            }
          >
            {error instanceof Error ? error.message : floorTableSetupCopy.loadError}
          </Alert>
        ) : null}

        {actionError ? (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        ) : null}

        {floors.length === 0 && !isError ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {floorTableSetupCopy.emptyFloors}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setFloorDialog({ open: true, mode: 'create', floor: null })}
            >
              {floorTableSetupCopy.addFloor}
            </Button>
          </Paper>
        ) : null}

        <Stack spacing={2}>
          {floors.map((floor) => {
            const expanded = expandedFloorId === floor.id;
            return (
              <Paper key={floor.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Stack
                  direction="row"
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: expanded ? 'var(--muted)' : 'background.paper',
                  }}
                  onClick={() => setExpandedFloorId(expanded ? null : floor.id)}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      aria-label={expanded ? 'Collapse floor' : 'Expand floor'}
                      sx={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <ChevronDown size={18} />
                    </IconButton>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{floor.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {floor.table_count ?? 0} tables · Order {floor.sort_order ?? '—'}
                      </Typography>
                    </Box>
                    <StatusChip status={floor.status} />
                  </Stack>
                  <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      aria-label={`Edit ${floor.name}`}
                      onClick={() => setFloorDialog({ open: true, mode: 'edit', floor })}
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Delete ${floor.name}`}
                      onClick={() => setDeleteTarget({ type: 'floor', floor })}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                </Stack>
                <Collapse in={expanded}>
                  <Box sx={{ px: 2, pb: 2, pt: 0 }}>
                    <FloorTablesPanel
                      floor={floor}
                      branchId={branchId}
                      onAddTable={() =>
                        setTableDialog({
                          open: true,
                          mode: 'create',
                          floor,
                          table: null,
                        })
                      }
                      onEditTable={(table) =>
                        setTableDialog({
                          open: true,
                          mode: 'edit',
                          floor,
                          table,
                        })
                      }
                      onDeleteTable={(table) => setDeleteTarget({ type: 'table', floor, table })}
                    />
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Stack>
      </Stack>

      <FloorFormDialog
        key={floorDialog.floor?.id ?? 'create'}
        open={floorDialog.open}
        mode={floorDialog.mode}
        initialFloor={floorDialog.floor}
        isPending={isMutating}
        onClose={() => setFloorDialog({ open: false, mode: 'create', floor: null })}
        onSubmit={handleFloorSubmit}
      />

      <TableFormDialog
        key={tableDialog.table?.id ?? `create-${tableDialog.floor?.id ?? 'none'}`}
        open={tableDialog.open}
        mode={tableDialog.mode}
        floorName={tableDialog.floor?.name}
        initialTable={tableDialog.table}
        isPending={isMutating}
        onClose={() => setTableDialog({ open: false, mode: 'create', floor: null, table: null })}
        onSubmit={handleTableSubmit}
      />

      <Dialog open={deleteTarget != null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>
          {deleteTarget?.type === 'floor'
            ? floorTableSetupCopy.deleteFloor
            : floorTableSetupCopy.deleteTable}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.type === 'floor'
              ? floorTableSetupCopy.deleteFloorConfirm
              : floorTableSetupCopy.deleteTableConfirm}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={isMutating}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirmDelete()}
            disabled={isMutating}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

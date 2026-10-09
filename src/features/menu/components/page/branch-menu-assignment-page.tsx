'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Building2, ChevronRight, RefreshCw, Store } from 'lucide-react';

import { flowPaths } from '@/config/shell/flow-paths';
import { routes } from '@/config/routes';
import { MenuItemsTableSkeleton } from '../skeleton/menu-items-table-skeleton';
import {
  useAssignBranchMenuMutation,
  useBranchMenuAssignmentsQuery,
  useSyncBranchMenuMutation,
} from '../../hooks/use-branch-menu-assignments';

export function BranchMenuAssignmentPage() {
  const { data, isPending, error, refetch, isError } = useBranchMenuAssignmentsQuery();
  const assignMutation = useAssignBranchMenuMutation();
  const syncMutation = useSyncBranchMenuMutation();
  const [userSelectedMenuByBranch, setUserSelectedMenuByBranch] = useState<Record<string, string>>(
    {},
  );

  const selectedMenuByBranch = useMemo(() => {
    const map: Record<string, string> = {};
    if (data?.assignments) {
      for (const row of data.assignments) {
        if (row.menuId != null) {
          map[String(row.branchId)] = String(row.menuId);
        }
      }
    }
    return { ...map, ...userSelectedMenuByBranch };
  }, [data, userSelectedMenuByBranch]);

  let pendingKey: string | null = null;
  if (assignMutation.isPending) {
    pendingKey = `assign-${assignMutation.variables?.branchId}`;
  } else if (syncMutation.isPending) {
    pendingKey = `sync-${syncMutation.variables?.branchId}`;
  }

  const handleAssign = useCallback(
    async (branchId: number) => {
      const menuId = Number(selectedMenuByBranch[String(branchId)]);
      if (!Number.isInteger(menuId) || menuId <= 0) return;
      try {
        await assignMutation.mutateAsync({ branchId, menuId });
      } catch {
        // Error surfaced via mutation state
      }
    },
    [assignMutation, selectedMenuByBranch],
  );

  const handleSync = useCallback(
    async (branchId: number, assignmentId: number) => {
      try {
        await syncMutation.mutateAsync({ branchId, assignmentId });
      } catch {
        // Error surfaced via mutation state
      }
    },
    [syncMutation],
  );

  const loadError =
    (isError && error instanceof Error ? error.message : null) ||
    (assignMutation.isError && assignMutation.error instanceof Error
      ? assignMutation.error.message
      : null) ||
    (syncMutation.isError && syncMutation.error instanceof Error
      ? syncMutation.error.message
      : null);

  const menuCreationHref = flowPaths.company.menuCreation;

  return (
    <Box sx={{ width: '100%' }}>
      <Breadcrumbs separator={<ChevronRight size={14} />} sx={{ mb: 2 }} aria-label="Breadcrumb">
        <Typography
          component={Link}
          href={routes.dashboard.company}
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
        >
          Home
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          Menu Management
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Branch Menu Assignment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign a dine-in menu template to each outlet. Items scoped to a branch only sync to
            that outlet.
          </Typography>
        </Box>
        <Button
          component={Link}
          href={menuCreationHref}
          variant="outlined"
          startIcon={<Store size={16} />}
          sx={{ textTransform: 'none' }}
        >
          Menu Creation
        </Button>
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      ) : null}

      {isPending ? (
        <MenuItemsTableSkeleton />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Outlet</TableCell>
                <TableCell>Assigned menu</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.assignments ?? []).map((row) => {
                const selectedMenuId = selectedMenuByBranch[String(row.branchId)] ?? '';
                const isAssigning = pendingKey === `assign-${row.branchId}`;
                const isSyncing = pendingKey === `sync-${row.branchId}`;

                return (
                  <TableRow key={row.branchId} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Building2 size={16} aria-hidden />
                        {row.branchName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth sx={{ maxWidth: 280, mb: 0.5 }}>
                        <Select
                          displayEmpty
                          value={selectedMenuId}
                          onChange={(event) =>
                            setUserSelectedMenuByBranch((prev) => ({
                              ...prev,
                              [String(row.branchId)]: event.target.value,
                            }))
                          }
                        >
                          <MenuItem value="">Select menu</MenuItem>
                          {(data?.menus ?? []).map((menu) => (
                            <MenuItem key={menu.id} value={menu.id}>
                              {menu.name} ({menu.menuType})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {row.menuName ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          Current: {row.menuName}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block' }}
                        >
                          No menu assigned yet
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row.status ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!selectedMenuId || isAssigning}
                          onClick={() => void handleAssign(row.branchId)}
                          sx={{ textTransform: 'none' }}
                        >
                          {isAssigning ? 'Assigning…' : 'Assign'}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={row.assignmentId == null || isSyncing}
                          startIcon={<RefreshCw size={14} />}
                          onClick={() =>
                            row.assignmentId != null
                              ? void handleSync(row.branchId, row.assignmentId)
                              : undefined
                          }
                          sx={{ textTransform: 'none' }}
                        >
                          {isSyncing ? 'Syncing…' : 'Sync'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Button size="small" onClick={() => void refetch()} sx={{ textTransform: 'none' }}>
          Refresh
        </Button>
      </Box>
    </Box>
  );
}

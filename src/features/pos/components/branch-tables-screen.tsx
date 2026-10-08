'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { flowPaths } from '@/config/shell/flow-paths';
import { useAuth } from '@/context/auth';
import { UsersListPageSkeleton } from '@/features/user-roles/components/users-list/users-list-page-skeleton';
import { branchTablesCopy } from '@/features/pos/config/tables-copy';
import { BranchTableCard } from '@/features/pos/components/branch-table-card';
import { useBranchTablesOverview } from '@/features/pos/hooks/use-branch-tables';
import type { BranchTableView, TableOperationalStatus } from '@/features/pos/types/branch-tables';

function countByStatus(tables: readonly BranchTableView[], status: TableOperationalStatus): number {
  return tables.filter((table) => table.operationalStatus === status).length;
}

type StatCardProps = Readonly<{ label: string; value: number; hint?: string }>;

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 140 }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {hint ? (
          <Tooltip title={hint}>
            <Info size={14} aria-hidden />
          </Tooltip>
        ) : null}
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export function BranchTablesScreen() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? null;
  const [selectedFloorId, setSelectedFloorId] = useState<number | ''>('');

  const floorFilter = selectedFloorId === '' ? null : selectedFloorId;
  const { data, isPending, isError, error, refetch } = useBranchTablesOverview(
    floorFilter,
    branchId != null,
  );

  const allTables = useMemo(
    () => data?.sections.flatMap((section) => section.tables) ?? [],
    [data?.sections],
  );

  const stats = useMemo(
    () => ({
      total: allTables.length,
      vacant: countByStatus(allTables, 'vacant'),
      occupied: countByStatus(allTables, 'occupied'),
      billing: countByStatus(allTables, 'billing'),
    }),
    [allTables],
  );

  if (isPending) {
    return <UsersListPageSkeleton />;
  }

  if (!branchId) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="warning">{branchTablesCopy.branchRequired}</Alert>
      </Box>
    );
  }

  const floors = data?.floors ?? [];
  const sections = data?.sections ?? [];
  const hasFloors = floors.length > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' } }}
        >
          <Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
              {branchTablesCopy.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
              {branchTablesCopy.subtitle}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ minWidth: { sm: 280 } }}
          >
            <FormControl fullWidth size="small" disabled={!hasFloors}>
              <InputLabel id="branch-floor-select-label">{branchTablesCopy.floorLabel}</InputLabel>
              <Select
                labelId="branch-floor-select-label"
                label={branchTablesCopy.floorLabel}
                value={selectedFloorId}
                onChange={(event) => {
                  const raw = String(event.target.value);
                  setSelectedFloorId(raw === '' ? '' : Number(raw));
                }}
              >
                <MenuItem value="">
                  <em>{branchTablesCopy.allFloors}</em>
                </MenuItem>
                {floors.map((floor) => (
                  <MenuItem key={floor.id} value={floor.id}>
                    {floor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              component={Link}
              href={flowPaths.branch.floorTableSetup}
              variant="outlined"
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              {branchTablesCopy.setupLink}
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
            {error instanceof Error ? error.message : branchTablesCopy.loadError}
          </Alert>
        ) : null}

        {hasFloors ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <StatCard label={branchTablesCopy.stats.total} value={stats.total} />
            <StatCard
              label={branchTablesCopy.stats.vacant}
              value={stats.vacant}
              hint="Available for new dine-in orders."
            />
            <StatCard
              label={branchTablesCopy.stats.occupied}
              value={stats.occupied}
              hint="Updates when live order status API is connected."
            />
            <StatCard
              label={branchTablesCopy.stats.billing}
              value={stats.billing}
              hint="Updates when billing workflow API is connected."
            />
          </Stack>
        ) : null}

        {!hasFloors && !isError ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {branchTablesCopy.emptyFloors}
            </Typography>
            <Button component={Link} href={flowPaths.branch.floorTableSetup} variant="contained">
              {branchTablesCopy.setupLink}
            </Button>
          </Paper>
        ) : null}

        {sections.map((section) => (
          <Stack key={section.floor.id} spacing={1.5}>
            {selectedFloorId === '' ? (
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {section.floor.name}
              </Typography>
            ) : null}

            {section.tables.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {branchTablesCopy.emptyTables}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, minmax(0, 1fr))',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                {section.tables.map((table) => (
                  <BranchTableCard key={table.id} table={table} />
                ))}
              </Box>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Info, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

import { branchTablesCopy } from '@/features/pos/config/tables-copy';
import { TableStatusChip } from '@/features/pos/components/table-status-chip';
import type { BranchTableView } from '@/features/pos/types/branch-tables';
import { flowPaths } from '@/config/shell/flow-paths';

type BranchTableCardProps = Readonly<{
  table: BranchTableView;
}>;

function dineInHref(table: BranchTableView): string {
  const params = new URLSearchParams({
    table_id: String(table.id),
    floor_id: String(table.floorId),
  });
  return `${flowPaths.branch.dineIn}?${params.toString()}`;
}

export function BranchTableCard({ table }: BranchTableCardProps) {
  const isActionable = table.operationalStatus !== 'inactive';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        opacity: isActionable ? 1 : 0.72,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Stack spacing={0.25}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{table.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {table.seats} {branchTablesCopy.tableCard.seats} · {table.shape}
          </Typography>
        </Stack>
        <Tooltip title={branchTablesCopy.tableCard.statusHelp}>
          <TableStatusChip status={table.operationalStatus} showTooltip={false} />
        </Tooltip>
      </Stack>

      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}
      >
        <Tooltip title={branchTablesCopy.tableCard.statusHelp}>
          <Info size={14} aria-hidden />
        </Tooltip>
        {isActionable ? (
          <Button
            component={Link}
            href={dineInHref(table)}
            size="small"
            variant="contained"
            startIcon={<UtensilsCrossed size={14} />}
          >
            {branchTablesCopy.tableCard.openDineIn}
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Unavailable
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

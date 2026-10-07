'use client';

import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import { tableStatusTooltips } from '@/features/pos/config/tables-copy';
import { statusChipColor, statusLabel } from '@/features/pos/lib/map-branch-table';
import type { TableOperationalStatus } from '@/features/pos/types/branch-tables';

type TableStatusChipProps = Readonly<{
  status: TableOperationalStatus;
  showTooltip?: boolean;
}>;

export function TableStatusChip({ status, showTooltip = true }: TableStatusChipProps) {
  const chip = (
    <Chip
      size="small"
      label={statusLabel(status)}
      color={statusChipColor(status)}
      variant="outlined"
    />
  );

  if (!showTooltip) return chip;

  return (
    <Tooltip title={tableStatusTooltips[status]} arrow>
      {chip}
    </Tooltip>
  );
}

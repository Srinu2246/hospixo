'use client';

import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';

export interface EntityStatusChipProps {
  status: string;
  sx?: SxProps<Theme>;
}

export function EntityStatusChip({ status, sx }: Readonly<EntityStatusChipProps>) {
  const isActive = status === 'active';

  return (
    <Chip
      label={status}
      size="small"
      sx={[
        {
          borderRadius: '9999px',
          textTransform: 'capitalize',
          fontWeight: 600,
          fontSize: '0.75rem',
          bgcolor: isActive ? colors.entityList.successTint : 'action.hover',
          color: isActive ? 'success.main' : 'text.secondary',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

'use client';

import type { ElementType, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';

export interface EntityIdentityCellProps {
  icon: ElementType;
  name: string;
  code?: string | null;
  /** Extra chip after the name, e.g. "Default". */
  badge?: ReactNode;
  sx?: SxProps<Theme>;
}

export function EntityIdentityCell({
  icon: Icon,
  name,
  code,
  badge,
  sx,
}: Readonly<EntityIdentityCellProps>) {
  return (
    <Box
      sx={[
        { display: 'flex', alignItems: 'center', gap: 1.25 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: colors.entityList.infoTint,
          color: 'info.main',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {name}
          </Typography>
          {badge}
        </Box>
        {code ? (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Code: {code}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

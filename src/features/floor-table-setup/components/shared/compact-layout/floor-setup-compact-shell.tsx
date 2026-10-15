'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

import {
  compactPageRootSx,
  compactScrollMainSx,
  compactStickyFooterSx,
  compactStickyHeaderSx,
} from '@/features/floor-table-setup/components/shared/compact-layout/compact-layout-sx';

type FloorSetupCompactShellProps = Readonly<{
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}>;

export function FloorSetupCompactShell({ header, footer, children }: FloorSetupCompactShellProps) {
  return (
    <Box sx={compactPageRootSx}>
      {header ? <Box sx={compactStickyHeaderSx}>{header}</Box> : null}
      <Box component="main" sx={compactScrollMainSx}>
        {children}
      </Box>
      {footer ? (
        <Box component="footer" sx={compactStickyFooterSx}>
          {footer}
        </Box>
      ) : null}
    </Box>
  );
}

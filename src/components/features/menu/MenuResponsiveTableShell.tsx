'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

import {
  menuCompactListViewportSx,
  menuDesktopDataGridShellSx,
  menuResponsiveTableRootSx,
} from '@/lib/helpers/menu/menuLayout';

export interface MenuResponsiveTableShellProps {
  compact: ReactNode;
  desktop: ReactNode;
}

/** Compact list below md; DataGrid (or desktop body) at md+. */
export function MenuResponsiveTableShell({
  compact,
  desktop,
}: Readonly<MenuResponsiveTableShellProps>) {
  return (
    <Box sx={menuResponsiveTableRootSx}>
      <Box sx={menuCompactListViewportSx}>{compact}</Box>
      <Box sx={menuDesktopDataGridShellSx}>{desktop}</Box>
    </Box>
  );
}

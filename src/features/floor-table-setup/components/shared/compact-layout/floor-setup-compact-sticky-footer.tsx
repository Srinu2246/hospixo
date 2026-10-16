'use client';

import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';

import {
  compactMuiSpacing,
  compactTouchButtonSx,
} from '@/features/floor-table-setup/components/shared/compact-layout/compact-layout-sx';

type FloorSetupCompactStickyFooterProps = Readonly<{
  back: ReactNode;
  primary: ReactNode;
}>;

/** Equal-width back + primary actions for compact sticky footers. */
export function FloorSetupCompactStickyFooter({
  back,
  primary,
}: FloorSetupCompactStickyFooterProps) {
  return (
    <Stack direction="row" spacing={compactMuiSpacing.footerButtonGap} sx={{ width: '100%' }}>
      <Stack sx={compactTouchButtonSx}>{back}</Stack>
      <Stack sx={compactTouchButtonSx}>{primary}</Stack>
    </Stack>
  );
}

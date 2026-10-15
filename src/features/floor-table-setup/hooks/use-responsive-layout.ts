'use client';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/** Viewports below theme `lg` (1200px) use compact MUI layouts; desktop stays unchanged. */
export function useFloorTableSetupResponsive() {
  const theme = useTheme();
  const isCompactLayout = useMediaQuery(theme.breakpoints.down('lg'));
  const isTabletLayout = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  return { isCompactLayout, isTabletLayout };
}

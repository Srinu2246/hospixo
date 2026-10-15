import type { SxProps, Theme } from '@mui/material/styles';

export const COMPACT_CONTENT_MAX_WIDTH = 720;

/** Root shell: centered column; horizontal inset comes from workspace `mainPadding`. */
export const compactPageRootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: { xs: '100%', sm: COMPACT_CONTENT_MAX_WIDTH },
  mx: 'auto',
  minHeight: 'calc(100dvh - 8rem)',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

export const compactScrollMainSx: SxProps<Theme> = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
  pb: 1,
};

/** Sticky top chrome (tabs, list titles). */
export const compactStickyHeaderSx: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 11,
  bgcolor: 'background.default',
  pt: 1.5,
  pb: 1,
  borderBottom: 1,
  borderColor: 'divider',
};

/** Sticky bottom action bar — sits above workspace bottom navigation. */
export const compactStickyFooterSx: SxProps<Theme> = {
  position: 'sticky',
  bottom: 0,
  zIndex: 11,
  bgcolor: 'background.default',
  borderTop: 1,
  borderColor: 'divider',
  py: 1.5,
  mt: 'auto',
};

export const compactTouchButtonSx: SxProps<Theme> = {
  minHeight: 44,
  flex: 1,
};

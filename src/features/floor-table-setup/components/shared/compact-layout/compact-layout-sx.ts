import type { SxProps, Theme } from '@mui/material/styles';

export const COMPACT_CONTENT_MAX_WIDTH = 720;

/**
 * Compact MUI spacing (8px grid): legacy 24px→20px (3→2.5), legacy 20px→16px (2.5→2).
 */
export const compactMuiSpacing = {
  section: 2.5,
  block: 2,
  dialogPaddingX: 2.5,
  stickyHeaderPt: 2,
  stickyHeaderPb: 2.5,
  stickyFooterPy: 2,
  footerButtonGap: 1.25,
} as const;

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
  gap: compactMuiSpacing.block,
  width: '100%',
  pb: 1,
};

/** Sticky top chrome (tabs, list titles). */
export const compactStickyHeaderSx: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 11,
  bgcolor: 'background.default',
  pt: compactMuiSpacing.stickyHeaderPt,
  pb: compactMuiSpacing.stickyHeaderPb,
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
  py: compactMuiSpacing.stickyFooterPy,
  mt: 'auto',
};

export const compactTouchButtonSx: SxProps<Theme> = {
  minHeight: 44,
  flex: 1,
};

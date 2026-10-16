import type { SxProps, Theme } from '@mui/material/styles';

export const COMPACT_CONTENT_MAX_WIDTH = 720;

/** PR #35 compact spacing: legacy 24px→20px (2.5), legacy 20px→16px (2). */
export const compactMuiSpacing = {
  section: 2.5,
  block: 2,
  dialogPaddingX: 2.5,
  stickyHeaderPt: 2,
  stickyHeaderPb: 2.5,
  stickyFooterPy: 2,
  footerButtonGap: 1.25,
} as const;

export const compactPageRootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: { xs: '100%', sm: COMPACT_CONTENT_MAX_WIDTH, md: '100%' },
  mx: { xs: 'auto', md: 0 },
  minHeight: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
};

/** Sticky tab bar on mobile/tablet only; desktop keeps the original in-flow tabs. */
export const compactDetailTabsHeaderSx: SxProps<Theme> = {
  position: { xs: 'sticky', md: 'static' },
  top: { xs: 0, md: 'auto' },
  zIndex: { xs: 11, md: 'auto' },
  bgcolor: { xs: 'background.default', md: 'transparent' },
  pt: { xs: compactMuiSpacing.stickyHeaderPt, md: 0 },
  pb: { xs: compactMuiSpacing.stickyHeaderPb, md: 0 },
};

/** Full-width cells inside sticky footer grid (mobile/tablet only). */
export const compactTouchButtonSx: SxProps<Theme> = {
  minHeight: 44,
  width: '100%',
};

export const stickyFooterShellSx: SxProps<Theme> = {
  width: '100%',
  bgcolor: 'background.paper',
  borderTop: '1px solid',
  borderColor: 'divider',
  px: { xs: 2, md: compactMuiSpacing.section },
  py: compactMuiSpacing.stickyFooterPy,
  boxSizing: 'border-box',
};

/** Back 40% + primary 60% (mobile/tablet sticky footer only). */
export const stickyFooterActionsGridSx: SxProps<Theme> = {
  display: 'grid',
  width: '100%',
  gap: compactMuiSpacing.footerButtonGap,
  gridTemplateColumns: '2fr 3fr',
  gridTemplateAreas: '"back primary"',
  alignItems: 'stretch',
};

export const stickyFooterBackOnlyGridSx: SxProps<Theme> = {
  display: 'grid',
  width: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateAreas: '"back"',
};

/** Status + bulk actions on wizard/catalog table lists (mobile/tablet). */
export const tableToolbarActionsGridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: compactMuiSpacing.footerButtonGap,
  width: '100%',
  alignItems: 'stretch',
  '& > .MuiFormControl-root': { minWidth: 0 },
  '& .MuiButton-root': { minHeight: 44, width: '100%' },
} as const;

export const compactFilterDropdownSx = {
  width: '100%',
  height: 44,
  '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const;

/** Sort + Status filters on one row (floors list mobile/tablet). */
export const filterRowGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr' },
  gap: compactMuiSpacing.footerButtonGap,
  width: '100%',
  '& > .MuiFormControl-root': { minWidth: 0 },
} as const;

export const listPageTitleSx = {
  fontWeight: 800,
  fontSize: { xs: '1.15rem', md: '1.25rem' },
  lineHeight: 1.25,
} as const;

export const listPageSubtitleSx = {
  color: 'text.secondary',
  fontSize: '0.8125rem',
  mt: 0.25,
  lineHeight: 1.45,
} as const;

/** Room for portaled footer above the fold on mobile/tablet. */
export const pageBottomClearanceSx = {
  pb: { xs: 2, sm: 2.5 },
} as const;

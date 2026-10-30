import { screen } from '@/lib/theme/mui/breakpoints';

/** AppShell main already applies 16px padding on mobile/tablet — avoid doubling in feature panes. */
export const menuFeaturePaneInsetSx = {
  px: { [screen.mobile]: 0, [screen.tablet]: 0, [screen.desktop]: 0 },
  pt: { [screen.mobile]: 0, [screen.tablet]: 0, [screen.desktop]: 0 },
};

/** Scrollable content clearance above branch workspace bottom nav. */
export const menuWorkspaceBottomNavPbSx = {
  pb: { [screen.mobile]: 10, [screen.tablet]: 10, [screen.desktop]: 0 },
};

/** Page title block + primary action on one row (mobile/tablet and desktop). */
export const menuPageHeaderGridSx = {
  display: 'grid',
  width: '100%',
  gap: 1.5,
  alignItems: 'start',
  gridTemplateColumns: {
    [screen.mobile]: 'minmax(0, 1fr) auto',
    [screen.tablet]: 'minmax(0, 1fr) auto',
    [screen.desktop]: 'minmax(0, 1fr) auto',
  },
  '& .MuiButton-root': {
    minWidth: 0,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    alignSelf: 'start',
  },
};

/** Upload CSV (2) + Add Item (3) on compact; auto columns on desktop. */
export const menuActionButtonsGridSx = {
  display: 'grid',
  width: '100%',
  gap: 1.5,
  gridTemplateColumns: {
    [screen.mobile]: '2fr 3fr',
    [screen.tablet]: '2fr 3fr',
    [screen.desktop]: 'repeat(2, auto)',
  },
  justifyContent: { [screen.desktop]: 'flex-start' },
  '& .MuiButton-root': {
    width: '100%',
    minWidth: 0,
  },
};

/** Search (3) + Session Menu (2) on compact. */
export const menuFiltersGridSx = {
  display: 'grid',
  width: '100%',
  gap: 1.5,
  gridTemplateColumns: {
    [screen.mobile]: '3fr 2fr',
    [screen.tablet]: '3fr 2fr',
    [screen.desktop]: 'minmax(200px, 300px) minmax(140px, 200px)',
  },
  alignItems: 'stretch',
  '& .MuiButton-root, & .MuiFormControl-root': {
    width: '100%',
    minWidth: 0,
  },
};

/** Cancel + primary action side by side (e.g. Create Category footer). */
export const menuFormFooterGridSx = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 1.5,
  pt: 1,
  width: '100%',
  '& .MuiButton-root': {
    width: '100%',
    minWidth: 0,
  },
};

export const menuDashedAddCategoryButtonSx = {
  borderStyle: 'dashed',
  borderWidth: 1,
  borderColor: 'primary.main',
  color: 'primary.main',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  px: 1.5,
  py: 0.75,
  fontSize: '0.8125rem',
  minHeight: 36,
};

/** Horizontal category rail on mobile/tablet; vertical list on desktop. */
export const menuCategoryListSx = {
  display: 'flex',
  flexDirection: { [screen.mobile]: 'row', [screen.tablet]: 'row', [screen.desktop]: 'column' },
  flexWrap: { [screen.mobile]: 'nowrap', [screen.tablet]: 'nowrap', [screen.desktop]: 'nowrap' },
  overflowX: { [screen.mobile]: 'auto', [screen.tablet]: 'auto', [screen.desktop]: 'visible' },
  overflowY: { [screen.mobile]: 'hidden', [screen.tablet]: 'hidden', [screen.desktop]: 'auto' },
  gap: { [screen.mobile]: 0.75, [screen.tablet]: 0.75, [screen.desktop]: 0.25 },
  flex: { [screen.mobile]: '0 0 auto', [screen.tablet]: '0 0 auto', [screen.desktop]: 1 },
  minHeight: 0,
  pb: { [screen.mobile]: 0.5, [screen.tablet]: 0.5, [screen.desktop]: 0 },
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'thin',
};

export const menuCategoryListItemSx = {
  flexShrink: { [screen.mobile]: 0, [screen.tablet]: 0, [screen.desktop]: 1 },
  minWidth: { [screen.mobile]: 'max-content', [screen.tablet]: 'max-content', [screen.desktop]: 0 },
};

/** Dietary + status dropdowns side by side on compact (Menu Availability). */
export const menuAvailabilityFilterDropdownsGridSx = {
  display: 'grid',
  width: '100%',
  gap: 1.5,
  gridTemplateColumns: {
    [screen.mobile]: '1fr 1fr',
    [screen.tablet]: '1fr 1fr',
    [screen.desktop]: 'auto auto',
  },
  '& .MuiFormControl-root': {
    width: '100%',
    minWidth: 0,
  },
};

/** Horizontal scroll for channel chips on compact widths. */
export const menuChannelSelectorCompactSx = {
  flexWrap: { [screen.mobile]: 'nowrap', [screen.tablet]: 'nowrap', [screen.desktop]: 'wrap' },
  overflowX: { [screen.mobile]: 'auto', [screen.tablet]: 'auto', [screen.desktop]: 'visible' },
  overflowY: 'hidden',
  pb: { [screen.mobile]: 0.5, [screen.tablet]: 0.5, [screen.desktop]: 0 },
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'thin',
  '& > *': {
    flexShrink: { [screen.mobile]: 0, [screen.tablet]: 0, [screen.desktop]: 1 },
  },
};

export const menuResponsiveTableRootSx = {
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

export const menuCompactListViewportSx = {
  display: { [screen.mobile]: 'block', [screen.tablet]: 'block', [screen.desktop]: 'none' },
};

export const menuDesktopDataGridShellSx = {
  display: { [screen.mobile]: 'none', [screen.tablet]: 'none', [screen.desktop]: 'flex' },
  flex: 1,
  minHeight: 0,
  flexDirection: 'column',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
};

/** Shared bordered stack for mobile/tablet menu rows. */
export const menuCompactListContainerSx = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  bgcolor: 'background.paper',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

import type { SxProps, Theme } from '@mui/material/styles';

import { screen } from '@/lib/theme/mui/breakpoints';

/** Counteract AppShell main p: 2 so breadcrumb strips align edge-to-edge. */
export const userRolesBreadcrumbStripSx: SxProps<Theme> = {
  mt: { [screen.mobile]: -2, [screen.tablet]: -2, [screen.desktop]: -3 },
  mx: { [screen.mobile]: -2, [screen.tablet]: -2, [screen.desktop]: -3 },
  px: { [screen.mobile]: 2, [screen.tablet]: 2, [screen.desktop]: 3 },
  py: 1.5,
};

export const userRolesWizardStepperWrapSx: SxProps<Theme> = {
  my: { [screen.mobile]: 2, [screen.tablet]: 2.5, [screen.desktop]: 3 },
};

/** Space for sticky wizard footer above bottom nav on mobile and tablet. */
export const userRolesWizardContentPbSx: SxProps<Theme> = {
  pb: { [screen.mobile]: 10, [screen.tablet]: 10, [screen.desktop]: 3 },
};

/** Search + Filters side by side on compact screens. */
export const userRolesSearchFiltersGridSx: SxProps<Theme> = {
  display: 'grid',
  width: '100%',
  gap: 1.5,
  gridTemplateColumns: {
    [screen.mobile]: '3fr 2fr',
    [screen.tablet]: '3fr 2fr',
    [screen.desktop]: 'minmax(200px, 1fr) auto',
  },
  alignItems: 'stretch',
  '& .MuiButton-root': {
    width: {
      [screen.mobile]: '100%',
      [screen.tablet]: '100%',
      [screen.desktop]: 'auto',
    },
    minWidth: 0,
  },
};

/** List card: no outer body padding on compact screens. */
export const userRolesListCardContentSx: SxProps<Theme> = {
  p: {
    [screen.mobile]: 0,
    [screen.tablet]: 0,
    [screen.desktop]: 2.5,
  },
};

/** Search/filters row inset on compact screens. */
export const userRolesListCardToolbarSx: SxProps<Theme> = {
  px: { [screen.mobile]: 2, [screen.tablet]: 2, [screen.desktop]: 0 },
  pt: { [screen.mobile]: 2, [screen.tablet]: 2, [screen.desktop]: 0 },
};

/** Table block inset on compact screens. */
export const userRolesListCardTableWrapSx: SxProps<Theme> = {
  width: '100%',
  px: { [screen.mobile]: 2, [screen.tablet]: 2, [screen.desktop]: 0 },
  pb: { [screen.mobile]: 2, [screen.tablet]: 2, [screen.desktop]: 0 },
};

/** Primary toolbar action below search row, end-aligned. */
export const userRolesToolbarSecondaryActionSx: SxProps<Theme> = {
  display: 'flex',
  width: '100%',
  justifyContent: 'flex-end',
};

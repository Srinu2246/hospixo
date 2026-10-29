import type { SxProps, Theme } from '@mui/material/styles';

import { screen } from '@/lib/theme/mui/breakpoints';

/** Counteract AppShell main `p: 2` so breadcrumb strips align edge-to-edge on mobile/tablet. */
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

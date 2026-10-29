import { screen } from '@/lib/theme/mui/breakpoints';

/** 16px (theme spacing 2) on mobile/tablet; caller spacing on desktop. */
export function responsiveSurfacePadding(desktopPadding: number | string) {
  return {
    [screen.mobile]: 2,
    [screen.tablet]: 2,
    [screen.desktop]: desktopPadding,
  };
}

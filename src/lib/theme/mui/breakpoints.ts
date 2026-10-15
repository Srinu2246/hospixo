/**
 * Shared viewport sizes. MUI breakpoints and component layouts both read these
 * values, so a screen change applies everywhere.
 *
 * mobile   0–767
 * tablet   768–1023
 * desktop  1024–1439
 * wide     1440+
 */
export const screens = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export type ScreenName = keyof typeof screens;

export const breakpoints = {
  xs: screens.mobile,
  sm: screens.tablet,
  md: screens.desktop,
  lg: screens.wide,
  xl: 1920,
} as const;

/** MUI `sx` keys for the named screens. Mobile is the base size. */
export const screen = {
  mobile: 'xs',
  tablet: 'sm',
  desktop: 'md',
  wide: 'lg',
} as const satisfies Record<ScreenName, keyof typeof breakpoints>;

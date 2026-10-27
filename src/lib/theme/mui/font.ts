/** CSS variable set on `<html>` by `next/font` in the root layout. */
export const APP_FONT_VARIABLE = '--font-stack-sans-text';

/** App-wide typeface: Stack Sans Text, with system fallbacks. */
export const APP_FONT_FAMILY = `var(${APP_FONT_VARIABLE}), "Stack Sans Text", Arial, Helvetica, sans-serif`;

/**
 * Root font-size scale. Stack Sans Text has a larger x-height than Arial,
 * so 93.75% (15px at a 16px browser default) keeps UI type close to the previous size.
 */
export const APP_FONT_SIZE_SCALE = '88.75%';

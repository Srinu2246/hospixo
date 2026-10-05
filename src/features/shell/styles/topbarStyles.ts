import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';

export const workspaceTopbarRootSx: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 30,
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  height: '3.75rem',
  px: 2,
  bgcolor: colors.workspace.header,
  borderBottom: `1px solid ${colors.border.default}`,
};

export const topbarIconButtonSx: SxProps<Theme> = {
  width: '2.15rem',
  height: '2.15rem',
  borderRadius: '0.45rem',
  color: colors.text.secondary,
  '&:hover': {
    bgcolor: colors.surface.light,
    color: colors.text.primary,
  },
};

export const topbarOutlineButtonSx: SxProps<Theme> = {
  display: { xs: 'none', md: 'inline-flex' },
  alignItems: 'center',
  gap: 0.6,
  height: '2.25rem',
  px: 1.1,
  borderRadius: '0.45rem',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: `1px solid ${colors.border.default}`,
  bgcolor: colors.surface.default,
  color: colors.text.primary,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: colors.surface.light,
    borderColor: colors.border.default,
    boxShadow: 'none',
  },
};

export const topbarPrimaryButtonSx: SxProps<Theme> = {
  display: { xs: 'none', md: 'inline-flex' },
  alignItems: 'center',
  gap: 0.6,
  height: '2.25rem',
  px: 1.1,
  borderRadius: '0.45rem',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  bgcolor: colors.auth.accent,
  color: colors.auth.accentForeground,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: colors.auth.accent,
    filter: 'brightness(0.92)',
    boxShadow: 'none',
  },
};

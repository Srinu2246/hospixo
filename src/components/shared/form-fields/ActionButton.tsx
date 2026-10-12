'use client';

import type { MouseEvent, ReactNode } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { SxProps, Theme } from '@mui/material/styles';
import { colors } from '@/lib/theme/mui/colors';

export interface ActionButtonProps {
  children?: ReactNode; // Button text or content (optional for icon variant)
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void; // Click callback
  startIcon?: ReactNode; // Optional leading icon
  endIcon?: ReactNode; // Optional trailing icon
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'icon'; // Visual button style (default: primary)
  size?: 'small' | 'medium' | 'large'; // Size preset (default: medium)
  disabled?: boolean; // Disabled state flag
  loading?: boolean; // Loading state with spinner
  fullWidth?: boolean; // Stretch button to 100% width
  type?: 'button' | 'submit' | 'reset'; // Native button type
  ariaLabel?: string; // Accessible label (especially for icon-only buttons)
  form?: string; // HTML form id attribute for external submit triggers
  sx?: SxProps<Theme>; // Custom MUI style overrides
}

const SIZE_STYLES = {
  small: { height: 32, px: 1.5, fontSize: '0.8125rem', borderRadius: '6px' },
  medium: { height: 38, px: 2, fontSize: '0.875rem', borderRadius: '8px' },
  large: { height: 44, px: 2.5, fontSize: '0.9375rem', borderRadius: '10px' },
} as const;

export function ActionButton({
  children,
  onClick,
  startIcon,
  endIcon,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  ariaLabel,
  form,
  sx,
}: Readonly<ActionButtonProps>) {
  const sizeConfig = SIZE_STYLES[size];
  const isIconVariant = variant === 'icon';

  // Resolve visual variant styling
  const getVariantSx = () => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: colors.primary.default,
          color: colors.white.default,
          boxShadow: `0 2px 8px ${colors.sidebar.activeGlow}`,
          '&:hover': { bgcolor: colors.primary.dark },
        };
      case 'secondary':
        return {
          bgcolor: (theme: Theme) =>
            theme.palette.mode === 'dark' ? colors.surface.darkMuted : colors.surface.muted,
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: (theme: Theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : colors.border.light,
          },
        };
      case 'outlined':
        return {
          bgcolor: (theme: Theme) =>
            theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'text.secondary',
          },
        };
      case 'icon':
        return {
          bgcolor: 'transparent',
          color: 'text.secondary',
          border: '1px solid',
          borderColor: 'divider',
          minWidth: sizeConfig.height,
          width: sizeConfig.height,
          height: sizeConfig.height,
          p: 0,
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
            borderColor: 'text.secondary',
          },
        };
      case 'text':
        return {
          bgcolor: 'transparent',
          color: 'primary.main',
          '&:hover': { bgcolor: 'action.hover' },
        };
    }
  };

  return (
    <Button
      type={type}
      form={form}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      onClick={onClick}
      fullWidth={fullWidth}
      startIcon={
        !isIconVariant && (loading ? <CircularProgress size={16} color="inherit" /> : startIcon)
      }
      endIcon={!isIconVariant && (!loading ? endIcon : undefined)}
      sx={{
        height: sizeConfig.height,
        px: isIconVariant ? 0 : sizeConfig.px,
        fontSize: sizeConfig.fontSize,
        borderRadius: sizeConfig.borderRadius,
        fontWeight: 600,
        textTransform: 'none',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'all 0.15s ease',
        ...getVariantSx(),
        ...sx,
      }}
    >
      {loading && isIconVariant ? (
        <CircularProgress size={16} color="inherit" />
      ) : (
        (children ?? startIcon)
      )}
    </Button>
  );
}

export default ActionButton;

'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { colors } from '@/lib/theme/mui/colors';

export type AlertMessageVariant = 'error' | 'warning' | 'info' | 'success';

export interface AlertMessageProps {
  message: ReactNode;
  title?: string;
  variant?: AlertMessageVariant;
  icon?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  sx?: SxProps<Theme>;
}

const VARIANT_ICONS: Record<AlertMessageVariant, ReactNode> = {
  error: <AlertTriangle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
  success: <CheckCircle size={18} />,
};

const VARIANT_PALETTES: Record<
  AlertMessageVariant,
  {
    main: string;
    light: string;
    dark: string;
  }
> = {
  error: {
    main: colors.danger.default,
    light: colors.danger.light,
    dark: colors.danger.dark,
  },
  warning: {
    main: colors.warning.default,
    light: colors.warning.light,
    dark: colors.warning.dark,
  },
  info: {
    main: colors.info.default,
    light: colors.info.light,
    dark: colors.info.dark,
  },
  success: {
    main: colors.success.default,
    light: colors.success.light,
    dark: colors.success.dark,
  },
};

/**
 * AlertMessage Component
 *
 * Reusable banner component to surface notices, warnings, and error disclaimers.
 * Features theme-compliant tints, custom icon overrides, and close actions.
 * Exclusively uses tokens from `@/lib/theme/mui/colors`.
 */
export function AlertMessage({
  message,
  title,
  variant = 'error',
  icon,
  action,
  onClose,
  sx,
}: Readonly<AlertMessageProps>) {
  const palette = VARIANT_PALETTES[variant] || VARIANT_PALETTES.error;
  const alertIcon = icon ?? VARIANT_ICONS[variant] ?? <AlertCircle size={18} />;

  return (
    <Box
      role="alert"
      sx={[
        (theme) => {
          const isDark = theme.palette.mode === 'dark';
          return {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            borderRadius: '10px',
            bgcolor: isDark ? alpha(palette.main, 0.12) : alpha(palette.main, 0.06),
            border: '1px solid',
            borderColor: isDark ? alpha(palette.main, 0.28) : alpha(palette.main, 0.22),
            color: isDark ? palette.light : palette.dark,
            boxSizing: 'border-box',
            transition: 'all 0.2s ease-in-out',
          };
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {/* Left Icon + Text Content */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: palette.main,
            flexShrink: 0,
          }}
        >
          {alertIcon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          {title && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                lineHeight: 1.3,
                mb: 0.25,
              }}
            >
              {title}
            </Typography>
          )}

          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '0.84375rem',
              lineHeight: 1.45,
              wordBreak: 'break-word',
            }}
          >
            {message}
          </Typography>
        </Box>
      </Box>

      {/* Right Custom Action or Dismiss Button */}
      {(action || onClose) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 1 }}>
          {action}
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              aria-label="Dismiss alert"
              sx={{
                color: palette.main,
                p: 0.5,
                '&:hover': {
                  bgcolor: (theme) =>
                    alpha(palette.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                },
              }}
            >
              <X size={16} />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
}

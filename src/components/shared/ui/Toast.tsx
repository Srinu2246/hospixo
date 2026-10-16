'use client';

import type { ReactNode } from 'react';
import Snackbar, { type SnackbarOrigin } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide, { type SlideProps } from '@mui/material/Slide';
import type { SxProps, Theme } from '@mui/material/styles';
import { colors } from '@/lib/theme/mui/colors';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastProps {
  open: boolean;
  message?: ReactNode;
  severity?: ToastSeverity;
  onClose: () => void;
  autoHideDuration?: number;
  anchorOrigin?: SnackbarOrigin;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

function SlideTransition(props: Readonly<SlideProps>) {
  return <Slide {...props} direction="down" />;
}

/**
 * Toast Component
 *
 * Global notification toast displayed by default at top-center.
 * Uses semantic theme tokens from `@/lib/theme/mui/colors`.
 */
export function Toast({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 2500,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
  action,
  sx,
}: Readonly<ToastProps>) {
  const getSeverityBgColor = () => {
    switch (severity) {
      case 'success':
        return colors.success.default;
      case 'info':
        return colors.info.default;
      case 'warning':
        return colors.warning.default;
      case 'error':
        return colors.danger.default;
      default:
        return colors.success.default;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={(_event, reason) => {
        if (reason === 'clickaway') return;
        onClose();
      }}
      anchorOrigin={anchorOrigin}
      slots={{
        transition: SlideTransition,
      }}
      sx={{
        top: 24,
        ...((sx as object) || {}),
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        action={action}
        sx={{
          minWidth: 280,
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.875rem',
          bgcolor: getSeverityBgColor(),
          color: colors.white.default,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          '& .MuiAlert-icon': {
            color: colors.white.default,
          },
          '& .MuiAlert-action': {
            color: colors.white.default,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

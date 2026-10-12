'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface LoadingProps {
  message?: string; // Optional text displayed below spinner
  fullPage?: boolean; // Whether to center inside full available height (default: true)
  size?: number; // Spinner size in pixels (default: 36)
  color?: string; // Spinner color (default: #183EEB)
  sx?: SxProps<Theme>; // Container style overrides
}

// Global reusable Loading component for page transitions and data fetching states
export function Loading({
  message = 'Loading...',
  fullPage = true,
  size = 36,
  color,
  sx,
}: Readonly<LoadingProps>) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        width: '100%',
        minHeight: fullPage ? 'calc(100dvh - 120px)' : 200,
        height: fullPage ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.75,
        p: 3,
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      <CircularProgress size={size} sx={{ color: color || 'primary.main' }} />
      {message ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            userSelect: 'none',
          }}
        >
          {message}
        </Typography>
      ) : null}
    </Box>
  );
}

export default Loading;

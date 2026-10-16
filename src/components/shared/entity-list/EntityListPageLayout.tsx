'use client';

import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { RefreshCw } from 'lucide-react';

import { screen } from '@/lib/theme/mui/breakpoints';
import { colors } from '@/lib/theme/mui/colors';

export interface EntityListPageLayoutProps {
  /** Small uppercase trail above the title, e.g. "Organisation · Companies". */
  breadcrumb: string;
  title: string;
  subtitle: string;
  onRefresh: () => void;
  error?: string | null;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * List page frame
 * 1. Breadcrumb, title, subtitle, Refresh
 * 2. Error alert with Retry
 * 3. Page body
 */
export function EntityListPageLayout({
  breadcrumb,
  title,
  subtitle,
  onRefresh,
  error,
  children,
  sx,
}: Readonly<EntityListPageLayoutProps>) {
  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 auto',
          minHeight: '100%',
          gap: 1.5,
          bgcolor: colors.entityList.canvas,
          // Cancel the AppShell main padding so the canvas colour reaches the edges.
          m: { [screen.mobile]: -2, [screen.desktop]: -3 },
          px: { [screen.mobile]: 1.5, [screen.tablet]: 2, [screen.desktop]: 2.5 },
          pt: { [screen.mobile]: 1.25, [screen.tablet]: 1.5 },
          pb: { [screen.mobile]: 8, [screen.desktop]: 10 },
          boxSizing: 'border-box',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {breadcrumb}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={onRefresh}
            startIcon={<RefreshCw size={15} />}
            sx={{
              borderRadius: '0.5rem',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error ? (
        <Alert
          severity="error"
          sx={{ borderRadius: '0.75rem' }}
          action={
            <Button color="inherit" size="small" onClick={onRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : null}

      {children}
    </Box>
  );
}

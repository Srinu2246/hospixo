'use client';

import type { ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import { RefreshCw } from 'lucide-react';

export type EntityListPageLayoutProps = Readonly<{
  breadcrumb: string;
  title: string;
  subtitle: string;
  onRefresh: () => void;
  error?: string | Error | null;
  children: ReactNode;
}>;

export function EntityListPageLayout({
  breadcrumb,
  title,
  subtitle,
  onRefresh,
  error,
  children,
}: EntityListPageLayoutProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto',
        width: '100%',
        maxWidth: '100%',
        minHeight: '100%',
        gap: 1.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc'),
        px: { xs: 1.5, sm: 2, md: 2.5 },
        pt: { xs: 1.25, sm: 1.5 },
        pb: { xs: 8, md: 10 },
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
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
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error state */}
      {errorMessage ? (
        <Alert
          severity="error"
          sx={{ borderRadius: '0.75rem', flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={onRefresh}>
              Retry
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      ) : null}

      {children}

      {/* Bottom spacer for viewport clearance */}
      <Box sx={{ height: { xs: 32, md: 48 }, flexShrink: 0 }} aria-hidden />
    </Box>
  );
}

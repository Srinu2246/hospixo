'use client';

import type { ElementType } from 'react';
import { Box, Card, Skeleton, Typography } from '@mui/material';
import { CheckCircle2, XCircle } from 'lucide-react';

export type EntityListMetrics = Readonly<{
  total: number;
  active: number;
  inactive: number;
}>;

type EntityListMetricsRowProps = Readonly<{
  metrics: EntityListMetrics;
  totalLabel: string;
  activeLabel: string;
  inactiveLabel: string;
  totalIcon: ElementType;
  isLoading?: boolean;
}>;

export function EntityListMetricsRow({
  metrics,
  totalLabel,
  activeLabel,
  inactiveLabel,
  totalIcon: TotalIcon,
  isLoading = false,
}: EntityListMetricsRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 1.25,
        flexShrink: 0,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          borderRadius: '0.75rem',
          p: { xs: '0.75rem 1rem', md: '0.875rem 1.125rem' },
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {totalLabel}
          </Typography>
          <Typography
            sx={{ fontSize: '1.35rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
          >
            {isLoading ? <Skeleton width={48} height={32} /> : metrics.total}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
            color: 'info.main',
            flexShrink: 0,
          }}
        >
          <TotalIcon size={18} />
        </Box>
      </Card>

      <Card
        variant="outlined"
        sx={{
          borderRadius: '0.75rem',
          p: { xs: '0.75rem 1rem', md: '0.875rem 1.125rem' },
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {activeLabel}
          </Typography>
          <Typography
            sx={{ fontSize: '1.35rem', fontWeight: 700, color: 'success.main', mt: 0.25 }}
          >
            {isLoading ? <Skeleton width={48} height={32} /> : metrics.active}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.1)',
            color: 'success.main',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={18} />
        </Box>
      </Card>

      <Card
        variant="outlined"
        sx={{
          borderRadius: '0.75rem',
          p: { xs: '0.75rem 1rem', md: '0.875rem 1.125rem' },
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {inactiveLabel}
          </Typography>
          <Typography
            sx={{ fontSize: '1.35rem', fontWeight: 700, color: 'text.secondary', mt: 0.25 }}
          >
            {isLoading ? <Skeleton width={48} height={32} /> : metrics.inactive}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          <XCircle size={18} />
        </Box>
      </Card>
    </Box>
  );
}

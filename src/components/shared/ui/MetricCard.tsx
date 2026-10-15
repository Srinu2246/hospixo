'use client';

import { Box, Card, LinearProgress, Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

export type MetricCardAccent = 'info' | 'warning' | 'success';

export type MetricCardProps = Readonly<{
  label: string;
  icon: LucideIcon;
  sharePercent: number;
  /** Shown after the percentage, e.g. "orders" → "64.0% of orders". */
  shareOf?: string;
  primaryValue: string | number;
  secondaryValue: string;
  progress?: number;
  accent?: MetricCardAccent;
  sx?: SxProps<Theme>;
}>;

const accentPaletteKey: Record<MetricCardAccent, 'info' | 'warning' | 'success'> = {
  info: 'info',
  warning: 'warning',
  success: 'success',
};

function formatPrimaryValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN');
  }
  return value;
}

export function MetricCard({
  label,
  icon: Icon,
  sharePercent,
  shareOf = 'orders',
  primaryValue,
  secondaryValue,
  progress,
  accent = 'info',
  sx,
}: MetricCardProps) {
  const paletteKey = accentPaletteKey[accent];
  const progressValue = progress ?? sharePercent;
  const shareText = `${sharePercent.toFixed(sharePercent % 1 === 0 ? 0 : 1)}% of ${shareOf}`;

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 0,
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        p: { xs: 1.75, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        ...((sx as object) || {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '0.5rem',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => {
                const main = theme.palette[paletteKey].main;
                return alpha(main, theme.palette.mode === 'dark' ? 0.2 : 0.12);
              },
              color: `${paletteKey}.main`,
            }}
          >
            <Icon size={18} aria-hidden />
          </Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'text.secondary',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {shareText}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1.375rem', sm: '1.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          {formatPrimaryValue(primaryValue)}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '1.375rem', sm: '1.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {secondaryValue}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, progressValue))}
        aria-label={`${label} share ${shareText}`}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            bgcolor: `${paletteKey}.main`,
          },
        }}
      />
    </Card>
  );
}

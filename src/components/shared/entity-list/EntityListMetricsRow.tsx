'use client';

import type { ElementType } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { CheckCircle2, XCircle } from 'lucide-react';

import { SkeletonLoader } from '@/components/shared/ui/SkeletonLoader';
import { screen } from '@/lib/theme/mui/breakpoints';
import { colors } from '@/lib/theme/mui/colors';

interface EntityListMetrics {
  total: number;
  active: number;
  inactive: number;
}

export interface EntityListMetricsRowProps {
  metrics: EntityListMetrics;
  totalLabel: string;
  activeLabel: string;
  inactiveLabel: string;
  /** Icon shown on the total card. */
  totalIcon: ElementType;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
}

export function EntityListMetricsRow({
  metrics,
  totalLabel,
  activeLabel,
  inactiveLabel,
  totalIcon: TotalIcon,
  isLoading = false,
  sx,
}: Readonly<EntityListMetricsRowProps>) {
  const cards = [
    {
      label: totalLabel,
      value: metrics.total,
      color: 'info.main',
      iconBg: colors.entityList.infoTintStrong,
      icon: <TotalIcon size={18} />,
    },
    {
      label: activeLabel,
      value: metrics.active,
      color: 'success.main',
      iconBg: colors.entityList.successTint,
      icon: <CheckCircle2 size={18} />,
    },
    {
      label: inactiveLabel,
      value: metrics.inactive,
      color: 'text.secondary',
      iconBg: 'action.hover',
      icon: <XCircle size={18} />,
    },
  ];

  return (
    <Box
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: { [screen.mobile]: '1fr', [screen.tablet]: 'repeat(3, 1fr)' },
          gap: 1.25,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          variant="outlined"
          sx={{
            borderRadius: '0.75rem',
            p: { [screen.mobile]: '0.75rem 1rem', [screen.desktop]: '0.875rem 1.125rem' },
            bgcolor: 'background.paper',
            borderColor: 'divider',
            boxShadow: colors.entityList.cardShadow,
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
              {card.label}
            </Typography>
            <Typography
              component="div"
              sx={{ fontSize: '1.35rem', fontWeight: 700, color: card.color, mt: 0.25 }}
            >
              {isLoading ? <SkeletonLoader width={48} height={32} /> : card.value}
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
              bgcolor: card.iconBg,
              color: card.color,
              flexShrink: 0,
            }}
          >
            {card.icon}
          </Box>
        </Card>
      ))}
    </Box>
  );
}

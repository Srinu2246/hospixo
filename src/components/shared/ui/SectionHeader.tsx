'use client';

import { Box, Chip, Link, Typography } from '@mui/material';
import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

export type SectionHeaderProps = Readonly<{
  title: string;
  badge?: string;
  badgeColor?: 'default' | 'success' | 'warning' | 'info';
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  actionSlot?: ReactNode;
}>;

export function SectionHeader({
  title,
  badge,
  badgeColor = 'default',
  subtitle,
  actionLabel,
  actionHref = '#',
  actionSlot,
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        mb: 2,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {title}
          </Typography>
          {badge ? (
            <Chip
              label={badge}
              size="small"
              variant="outlined"
              color={badgeColor === 'default' ? undefined : badgeColor}
              sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
            />
          ) : null}
        </Box>
        {subtitle ? (
          <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actionSlot ??
        (actionLabel ? (
          <Link
            href={actionHref}
            underline="hover"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {actionLabel}
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        ) : null)}
    </Box>
  );
}

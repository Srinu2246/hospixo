'use client';

import type { ElementType, ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';

import { formatPercent } from '@/features/dashboard/lib/format';

export type DashboardKpiCardProps = Readonly<{
  label: string;
  value: ReactNode;
  icon: ElementType;
  selected?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  changePercent?: number | null;
  changeLabel?: string;
  footerContent?: ReactNode;
}>;

export function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  selected = false,
  clickable = false,
  onClick,
  changePercent,
  changeLabel,
  footerContent,
}: DashboardKpiCardProps) {
  return (
    <Card
      variant="outlined"
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? selected : undefined}
      aria-label={clickable ? `Show ${label} details in the table` : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={{
        borderRadius: '0.75rem',
        p: '1.25rem 1.5rem',
        bgcolor: 'background.paper',
        borderColor: selected ? 'info.main' : 'divider',
        borderWidth: 1,
        boxShadow: selected
          ? (theme) =>
              `0 0 0 1px ${theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.5)'}`
          : '0 1px 2px rgb(0 0 0 / 0.04)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all 0.15s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        '&:hover': clickable
          ? {
              borderColor: 'info.main',
              boxShadow: '0 2px 4px rgb(0 0 0 / 0.06)',
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              display: 'block',
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              mt: '0.5rem',
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              display: 'block',
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(56, 189, 248, 0.16)'
                : 'rgba(14, 165, 233, 0.12)',
            color: 'info.main',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={18} aria-hidden />
        </Box>
      </Box>

      <Box sx={{ mt: '0.875rem' }}>
        {footerContent ??
          (typeof changePercent === 'number' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem' }}>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.8125rem',
                  color: changePercent >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {formatPercent(changePercent)}
              </Typography>
              {changeLabel ? (
                <Typography
                  component="span"
                  sx={{ fontSize: '0.8125rem', color: 'text.secondary', ml: 0.5 }}
                >
                  {changeLabel}
                </Typography>
              ) : null}
            </Box>
          ) : null)}
      </Box>
    </Card>
  );
}

export function DashboardKpiGrid({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

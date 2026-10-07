'use client';

import type { ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { Banknote, BarChart3, Globe, LineChart } from 'lucide-react';

import { companyLandingContent } from '@/features/dashboard/config/company';
import { formatCurrency, formatPercent } from '@/features/dashboard/lib/format';
import type { DashboardBranchStats, DashboardMetric } from '@/features/dashboard/types';

type KpiIcon = 'lineChart' | 'barChart' | 'globe' | 'banknote';

type MetricKpiItem = Readonly<{
  kind: 'metric';
  key: string;
  label: string;
  icon: KpiIcon;
  metric: DashboardMetric;
}>;

type BranchKpiItem = Readonly<{
  kind: 'branch';
  key: string;
  label: string;
  icon: 'barChart';
  stats: DashboardBranchStats;
}>;

export type KpiSummaryItem = MetricKpiItem | BranchKpiItem;

type KpiSummaryRowProps = Readonly<{
  items: readonly KpiSummaryItem[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
}>;

const iconMap = {
  lineChart: LineChart,
  barChart: BarChart3,
  globe: Globe,
  banknote: Banknote,
} as const;

function KpiCardShell({
  selected,
  clickable,
  label,
  onClick,
  children,
}: Readonly<{
  selected: boolean;
  clickable: boolean;
  label: string;
  onClick?: () => void;
  children: ReactNode;
}>) {
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
      {children}
    </Card>
  );
}

export function KpiSummaryRow({ items, selectedKey = null, onSelect }: KpiSummaryRowProps) {
  const { branchActiveLabel } = companyLandingContent.kpiSummary;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const selected = selectedKey === item.key;

        if (item.kind === 'branch') {
          return (
            <KpiCardShell
              key={item.key}
              selected={selected}
              clickable={Boolean(onSelect)}
              label={item.label}
              onClick={() => onSelect?.(item.key)}
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
                    {item.label}
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
                    {item.stats.total} Total
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
                <Typography sx={{ fontSize: '0.8125rem', color: 'success.main', fontWeight: 600 }}>
                  {item.stats.active} {branchActiveLabel}
                </Typography>
              </Box>
            </KpiCardShell>
          );
        }

        const isPositive = item.metric.changePercent >= 0;

        return (
          <KpiCardShell
            key={item.key}
            selected={selected}
            clickable={Boolean(onSelect)}
            label={item.label}
            onClick={() => onSelect?.(item.key)}
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
                  {item.label}
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
                  {formatCurrency(item.metric.amount)}
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
              <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8125rem' }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.8125rem',
                    color: isPositive ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {formatPercent(item.metric.changePercent)}
                </Typography>
                <Typography
                  component="span"
                  sx={{ fontSize: '0.8125rem', color: 'text.secondary', ml: 0.5 }}
                >
                  {item.metric.changeLabel}
                </Typography>
              </Box>
            </Box>
          </KpiCardShell>
        );
      })}
    </Box>
  );
}

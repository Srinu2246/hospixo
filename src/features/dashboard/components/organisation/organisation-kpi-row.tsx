'use client';

import { Box, Card, Typography } from '@mui/material';
import { BarChart3, Building2, LineChart, Store, TrendingUp } from 'lucide-react';

import { formatPercent } from '@/features/dashboard/lib/format';
import type { OrganisationDashboardKpi } from '@/features/dashboard/types/organisation-dashboard';

type OrganisationKpiRowProps = Readonly<{
  kpis: readonly OrganisationDashboardKpi[];
  selectedId?: string | null;
  onSelect?: (kpiId: string) => void;
}>;

function getKpiIcon(kpiId: string) {
  switch (kpiId) {
    case 'total-sales':
      return LineChart;
    case 'net-sales':
      return BarChart3;
    case 'companies':
      return Building2;
    case 'branches':
      return Store;
    default:
      return TrendingUp;
  }
}

export function OrganisationKpiRow({ kpis, selectedId = null, onSelect }: OrganisationKpiRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {kpis.map((kpi) => {
        const selected = selectedId === kpi.id;
        const Icon = getKpiIcon(kpi.id);

        return (
          <Card
            key={kpi.id}
            variant="outlined"
            onClick={onSelect ? () => onSelect(kpi.id) : undefined}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-pressed={onSelect ? selected : undefined}
            aria-label={onSelect ? `Show ${kpi.label} details in the table` : undefined}
            onKeyDown={
              onSelect
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(kpi.id);
                    }
                  }
                : undefined
            }
            sx={{
              borderRadius: '0.75rem',
              p: '1.25rem 1.5rem',
              bgcolor: 'background.paper',
              borderColor: selected ? 'info.main' : 'divider',
              boxShadow: selected
                ? (theme) =>
                    `0 0 0 1px ${theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(2, 132, 199, 0.5)'}`
                : '0 1px 2px rgb(0 0 0 / 0.04)',
              cursor: onSelect ? 'pointer' : 'default',
              transition: 'all 0.15s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'left',
              borderWidth: 1,
              '&:hover': onSelect
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
                alignItems: 'flex-start',
                justifyContent: 'space-between',
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
                  {kpi.label}
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
                  {kpi.value}
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
              {typeof kpi.changePercent === 'number' ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8125rem',
                      color: kpi.changePercent >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 600,
                    }}
                  >
                    {formatPercent(kpi.changePercent)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.8125rem', color: 'text.secondary', ml: 0.5 }}
                  >
                    {kpi.changeLabel}
                  </Typography>
                </Box>
              ) : kpi.helperText ? (
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {kpi.helperText}
                </Typography>
              ) : null}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

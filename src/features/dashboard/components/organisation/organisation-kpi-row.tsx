'use client';

import { Typography } from '@mui/material';
import { BarChart3, Building2, LineChart, Store, TrendingUp } from 'lucide-react';

import {
  DashboardKpiCard,
  DashboardKpiGrid,
} from '@/features/dashboard/components/shared/dashboard-kpi-card';
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
    <DashboardKpiGrid>
      {kpis.map((kpi) => {
        const selected = selectedId === kpi.id;
        const Icon = getKpiIcon(kpi.id);
        const clickable = Boolean(onSelect);
        const handleClick = onSelect ? () => onSelect(kpi.id) : undefined;

        const footerContent =
          typeof kpi.changePercent !== 'number' && kpi.helperText ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {kpi.helperText}
            </Typography>
          ) : undefined;

        return (
          <DashboardKpiCard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            icon={Icon}
            selected={selected}
            clickable={clickable}
            onClick={handleClick}
            changePercent={kpi.changePercent}
            changeLabel={kpi.changeLabel}
            footerContent={footerContent}
          />
        );
      })}
    </DashboardKpiGrid>
  );
}

'use client';

import { Typography } from '@mui/material';
import { Banknote, BarChart3, Globe, LineChart } from 'lucide-react';

import {
  DashboardKpiCard,
  DashboardKpiGrid,
} from '@/features/dashboard/components/shared/dashboard-kpi-card';
import { companyLandingContent } from '@/features/dashboard/config/company';
import { formatCurrency } from '@/features/dashboard/lib/format';
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

export function KpiSummaryRow({ items, selectedKey = null, onSelect }: KpiSummaryRowProps) {
  const { branchActiveLabel } = companyLandingContent.kpiSummary;

  return (
    <DashboardKpiGrid>
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const selected = selectedKey === item.key;
        const clickable = Boolean(onSelect);
        const handleClick = onSelect ? () => onSelect(item.key) : undefined;

        if (item.kind === 'branch') {
          return (
            <DashboardKpiCard
              key={item.key}
              label={item.label}
              value={`${item.stats.total} Total`}
              icon={Icon}
              selected={selected}
              clickable={clickable}
              onClick={handleClick}
              footerContent={
                <Typography sx={{ fontSize: '0.8125rem', color: 'success.main', fontWeight: 600 }}>
                  {item.stats.active} {branchActiveLabel}
                </Typography>
              }
            />
          );
        }

        return (
          <DashboardKpiCard
            key={item.key}
            label={item.label}
            value={formatCurrency(item.metric.amount)}
            icon={Icon}
            selected={selected}
            clickable={clickable}
            onClick={handleClick}
            changePercent={item.metric.changePercent}
            changeLabel={item.metric.changeLabel}
          />
        );
      })}
    </DashboardKpiGrid>
  );
}

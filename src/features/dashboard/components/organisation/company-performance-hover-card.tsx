'use client';

import { MetricHoverCard } from '@/features/dashboard/components/shared/metric-hover-card';
import { formatCurrency } from '@/features/dashboard/lib/format';
import type { OrganisationCompanyPerformanceRow } from '@/features/dashboard/types/organisation-dashboard';

type CompanyPerformanceHoverCardProps = Readonly<{
  row: OrganisationCompanyPerformanceRow;
  metricLabel: string;
  metricValue: string;
  placement?: 'start' | 'center' | 'end';
  sx?: object;
}>;

export function CompanyPerformanceHoverCard({
  row,
  metricLabel,
  metricValue,
  placement = 'center',
  sx,
}: CompanyPerformanceHoverCardProps) {
  const items = [
    { label: metricLabel, value: metricValue },
    { label: 'Branches', value: String(row.branches) },
    { label: 'Revenue', value: formatCurrency(row.revenue) },
    { label: 'Orders', value: row.orders.toLocaleString('en-IN') },
    { label: 'Expenses', value: formatCurrency(row.expenses) },
    { label: 'Profit', value: formatCurrency(row.profit) },
  ];

  return <MetricHoverCard title={row.companyName} items={items} placement={placement} sx={sx} />;
}

import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { formatCurrency } from '@/features/dashboard/lib/format';
import type { OrganisationCompanyPerformanceRow } from '@/features/dashboard/types/organisation-dashboard';

type CompanyPerformanceHoverCardProps = Readonly<{
  row: OrganisationCompanyPerformanceRow;
  metricLabel: string;
  metricValue: string;
  className?: string;
}>;

export function CompanyPerformanceHoverCard({
  row,
  metricLabel,
  metricValue,
  className,
}: CompanyPerformanceHoverCardProps) {
  return (
    <div
      className={className ? `${orgDash.hoverCard} ${className}` : orgDash.hoverCard}
      role="tooltip"
    >
      <p className={orgDash.hoverTitle}>{row.companyName}</p>
      <dl className={orgDash.hoverList}>
        <div className={orgDash.hoverItem}>
          <dt className={orgDash.hoverLabel}>{metricLabel}</dt>
          <dd className={orgDash.hoverValue}>{metricValue}</dd>
        </div>
        <div className={orgDash.hoverItem}>
          <dt className={orgDash.hoverLabel}>Branches</dt>
          <dd className={orgDash.hoverValue}>{row.branches}</dd>
        </div>
        <div className={orgDash.hoverItem}>
          <dt className={orgDash.hoverLabel}>Revenue</dt>
          <dd className={orgDash.hoverValue}>{formatCurrency(row.revenue)}</dd>
        </div>
        <div className={orgDash.hoverItem}>
          <dt className={orgDash.hoverLabel}>Orders</dt>
          <dd className={orgDash.hoverValue}>{row.orders.toLocaleString('en-IN')}</dd>
        </div>
        <div className={orgDash.hoverItem}>
          <dt className={orgDash.hoverLabel}>Expenses</dt>
          <dd className={orgDash.hoverValue}>{formatCurrency(row.expenses)}</dd>
        </div>
        <div className={orgDash.hoverItem}>
          <dt className={orgDash.hoverLabel}>Profit</dt>
          <dd className={orgDash.hoverValue}>{formatCurrency(row.profit)}</dd>
        </div>
      </dl>
    </div>
  );
}

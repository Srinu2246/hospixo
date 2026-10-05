import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import type {
  OrganisationCompanyChartPoint,
  OrganisationCompanyPerformanceRow,
  OrganisationCompanyStatus,
  OrganisationPerformanceMetricId,
} from '@/features/dashboard/types/organisation-dashboard';

import { CompanyPerformanceHoverCard } from './company-performance-hover-card';

const statusClassMap: Record<OrganisationCompanyStatus, string> = {
  active: orgDash.perfStatusactive,
  warning: orgDash.perfStatuswarning,
  inactive: orgDash.perfStatusinactive,
};

type CompanyPerformanceChartProps = Readonly<{
  series: readonly OrganisationCompanyChartPoint[];
  rowsById: ReadonlyMap<string, OrganisationCompanyPerformanceRow>;
  maxValue: number;
  metricLabel: string;
  metric: OrganisationPerformanceMetricId;
}>;

function formatChartMetricValue(value: number, metric: OrganisationPerformanceMetricId): string {
  if (metric === 'orders') {
    return value.toLocaleString('en-IN');
  }

  return formatCurrency(value);
}

export function CompanyPerformanceChart({
  series,
  rowsById,
  maxValue,
  metricLabel,
  metric,
}: CompanyPerformanceChartProps) {
  return (
    <div className={orgDash.perfChart}>
      {series.map((point) => {
        const heightPercent = Math.max(12, Math.round((point.value / maxValue) * 100));
        const row = rowsById.get(point.id);

        return (
          <div key={point.id} className={orgDash.perfChartcolumn}>
            <div className={orgDash.perfChartbartrack}>
              <div className={orgDash.perfChartbarinner} style={{ height: `${heightPercent}%` }}>
                <span className={orgDash.perfChartbar} aria-hidden />
                {row ? (
                  <CompanyPerformanceHoverCard
                    row={row}
                    metricLabel={metricLabel}
                    metricValue={formatChartMetricValue(point.value, metric)}
                    className={orgDash.perfCharthovercard}
                  />
                ) : null}
              </div>
            </div>
            <span className={orgDash.perfChartlabel} title={point.label}>
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

type CompanyPerformanceTableProps = Readonly<{
  rows: readonly OrganisationCompanyPerformanceRow[];
}>;

export function CompanyPerformanceTable({ rows }: CompanyPerformanceTableProps) {
  return (
    <div className={orgDash.perfTablewrap}>
      <table className={orgDash.perfTable}>
        <thead>
          <tr>
            <th>{organisationDashboardCopy.tableHeaders.companyName}</th>
            <th>{organisationDashboardCopy.tableHeaders.branches}</th>
            <th>{organisationDashboardCopy.tableHeaders.revenue}</th>
            <th>{organisationDashboardCopy.tableHeaders.orders}</th>
            <th>{organisationDashboardCopy.tableHeaders.expenses}</th>
            <th>{organisationDashboardCopy.tableHeaders.profit}</th>
            <th>{organisationDashboardCopy.tableHeaders.status}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.href ? (
                  <Link href={row.href} className={orgDash.perfCompanylink}>
                    {row.companyName}
                  </Link>
                ) : (
                  row.companyName
                )}
              </td>
              <td>{row.branches}</td>
              <td>{formatCurrency(row.revenue)}</td>
              <td>{row.orders.toLocaleString('en-IN')}</td>
              <td>{formatCurrency(row.expenses)}</td>
              <td
                className={
                  row.profit >= 0 ? orgDash.perfProfitpositive : orgDash.perfProfitnegative
                }
              >
                {formatCurrency(row.profit)}
              </td>
              <td>
                <span className={statusClassMap[row.status]}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CompanyPerformancePaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>;

export function CompanyPerformancePagination({
  currentPage,
  totalPages,
  onPageChange,
}: CompanyPerformancePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className={orgDash.perfPagination} aria-label="Company performance pagination">
      <button
        type="button"
        className={orgDash.perfPagebutton}
        aria-label="Previous page"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft aria-hidden size={16} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? orgDash.perfPagebuttonactive : orgDash.perfPagebutton}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        className={orgDash.perfPagebutton}
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight aria-hidden size={16} />
      </button>
    </nav>
  );
}

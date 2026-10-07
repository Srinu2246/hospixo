import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

function formatDashboardDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function resolveOrganisationDateRangeLabel(
  range: OrganisationDateRangeId,
  customRange?: Readonly<{ from: string; to: string }>,
): string {
  const now = new Date();

  switch (range) {
    case 'today':
      return 'Today';
    case 'last-7-days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return `${formatDashboardDate(start)} - ${formatDashboardDate(now)}`;
    }
    case 'last-30-days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return `${formatDashboardDate(start)} - ${formatDashboardDate(now)}`;
    }
    case 'custom': {
      if (customRange?.from && customRange.to) {
        const fromDate = parseOrganisationIsoDate(customRange.from);
        const toDate = parseOrganisationIsoDate(customRange.to);
        if (fromDate && toDate) {
          return `${formatDashboardDate(fromDate)} - ${formatDashboardDate(toDate)}`;
        }
      }
      return 'Custom range';
    }
    default:
      return 'Today';
  }
}

export function toOrganisationIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseOrganisationIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDefaultOrganisationCustomRange(): Readonly<{ from: string; to: string }> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: toOrganisationIsoDate(from), to: toOrganisationIsoDate(to) };
}

export function countOrganisationInclusiveDays(from: string, to: string): number {
  const fromDate = parseOrganisationIsoDate(from);
  const toDate = parseOrganisationIsoDate(to);
  if (!fromDate || !toDate) return 7;

  const start = fromDate <= toDate ? fromDate : toDate;
  const end = fromDate <= toDate ? toDate : fromDate;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1);
}

const organisationRangeProfiles: Record<
  OrganisationDateRangeId,
  Readonly<{
    scale: number;
    changeLabel: string;
    totalSalesChange: number;
    netSalesChange: number;
  }>
> = {
  today: {
    scale: 0.034,
    changeLabel: 'vs yesterday',
    totalSalesChange: 3.2,
    netSalesChange: 2.4,
  },
  'last-7-days': {
    scale: 0.22,
    changeLabel: 'vs prior week',
    totalSalesChange: 8.1,
    netSalesChange: 6.5,
  },
  'last-30-days': {
    scale: 0.72,
    changeLabel: 'vs prior month',
    totalSalesChange: 11.2,
    netSalesChange: 9.4,
  },
  custom: {
    scale: 0.22,
    changeLabel: 'vs prior period',
    totalSalesChange: 4.5,
    netSalesChange: 3.8,
  },
};

export function getOrganisationRangeProfile(
  range: OrganisationDateRangeId,
  customRange?: Readonly<{ from?: string; to?: string }>,
) {
  if (range === 'custom' && customRange?.from && customRange.to) {
    const days = countOrganisationInclusiveDays(customRange.from, customRange.to);
    const scale = Math.min(1, Math.max(0.034, (days / 30) * 0.72));
    return {
      ...organisationRangeProfiles.custom,
      scale,
    };
  }

  if (range === 'custom') {
    return organisationRangeProfiles.custom;
  }

  return organisationRangeProfiles[range];
}

export function formatOrganisationCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function scaleOrganisationAmount(
  amount: number,
  range: OrganisationDateRangeId,
  customRange?: Readonly<{ from?: string; to?: string }>,
): number {
  const profile = getOrganisationRangeProfile(range, customRange);
  return Math.round(amount * profile.scale);
}

export function formatRelativeTime(value?: string | Date): string {
  if (!value) return 'Recently';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-IN');
}

export function formatUsageValue(used: number, limit: number, unit?: string): string {
  const usedLabel = unit ? `${used} ${unit}` : used.toLocaleString('en-IN');
  const limitLabel = unit ? `${limit} ${unit}` : limit.toLocaleString('en-IN');
  return `${usedLabel} / ${limitLabel}`;
}

export function formatRenewalDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function resolveCompanyChartMetricValue(
  row: Readonly<{ revenue: number; orders: number; profit: number }>,
  metric: 'total-sales' | 'revenue' | 'orders' | 'profit',
): number {
  switch (metric) {
    case 'orders':
      return row.orders;
    case 'profit':
      return row.profit;
    case 'revenue':
    case 'total-sales':
    default:
      return row.revenue;
  }
}

export function buildCompanyChartSeries<
  T extends Readonly<{
    id: string;
    companyName: string;
    revenue: number;
    orders: number;
    profit: number;
  }>,
>(
  rows: readonly T[],
  metric: 'total-sales' | 'revenue' | 'orders' | 'profit',
): ReadonlyArray<{ id: string; label: string; value: number }> {
  return rows.map((row) => ({
    id: row.id,
    label: row.companyName,
    value: resolveCompanyChartMetricValue(row, metric),
  }));
}

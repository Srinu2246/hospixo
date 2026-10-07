import type { CompanyDashboardDisplayData } from '@/features/dashboard/lib/build-company-dashboard-data';
import { formatCurrency } from '@/features/dashboard/lib/format';

function escapeCsv(value: string | number) {
  const text = String(value);
  const safeText = typeof value === 'string' && /^[=+\-@]/.test(text) ? `'${text}` : text;
  if (/[",\n]/.test(safeText)) {
    return `"${safeText.replace(/"/g, '""')}"`;
  }
  return safeText;
}

export function exportCompanyDashboardCsv(data: CompanyDashboardDisplayData) {
  const sections: string[] = [
    'All Branches Statistics',
    `Date Range,${escapeCsv(data.dateRangeLabel)}`,
    '',
    'KPI,Amount,Change %,Change Label',
    `Total Sales,${escapeCsv(formatCurrency(data.kpis.totalSales.amount))},${data.kpis.totalSales.changePercent},${escapeCsv(data.kpis.totalSales.changeLabel)}`,
    `Online Sales,${escapeCsv(formatCurrency(data.kpis.onlineSales.amount))},${data.kpis.onlineSales.changePercent},${escapeCsv(data.kpis.onlineSales.changeLabel)}`,
    `Offline Sales,${escapeCsv(formatCurrency(data.kpis.offlineSales.amount))},${data.kpis.offlineSales.changePercent},${escapeCsv(data.kpis.offlineSales.changeLabel)}`,
    `Branches,${data.branchStats.total} Total,${data.branchStats.active} Active,`,
    '',
    'Branch,Orders,Sales,Net Sales,Tax,Discount,Modified,Re-printed,Waived Charges',
    ...data.salesByOutlet.map((row) =>
      [
        row.outletName,
        row.orders,
        formatCurrency(row.sales),
        formatCurrency(row.netSales),
        formatCurrency(row.tax),
        formatCurrency(row.discount),
        row.modified,
        row.reprinted,
        formatCurrency(row.waivedCharges),
      ]
        .map(escapeCsv)
        .join(','),
    ),
    '',
    'Tax Summary,Total',
    `Total,${formatCurrency(data.taxSummary.total)}`,
    ...data.taxSummary.items.map(
      (item) => `${escapeCsv(item.label)},${formatCurrency(item.amount)}`,
    ),
    '',
    'Discounts Summary,Total',
    `Total,${formatCurrency(data.discountsSummary.total)}`,
    ...data.discountsSummary.items.map(
      (item) => `${escapeCsv(item.label)},${formatCurrency(item.amount)}`,
    ),
  ];

  const blob = new Blob([sections.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'all-branches-statistics.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

import type { BranchDashboardDisplayData } from '@/features/dashboard/types/branch-dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';

function escapeCsv(value: string | number) {
  const text = String(value);
  const safeText = typeof value === 'string' && /^[=+\-@]/.test(text) ? `'${text}` : text;
  if (/[",\n]/.test(safeText)) {
    return `"${safeText.replace(/"/g, '""')}"`;
  }
  return safeText;
}

export function exportBranchDashboardCsv(data: BranchDashboardDisplayData) {
  const sections: string[] = [
    'Sales Statistics',
    `Outlet,${escapeCsv(data.outletName)}`,
    `Date Range,${escapeCsv(data.dateRangeLabel)}`,
    '',
    'KPI,Amount,Change %',
    `Total Sales,${formatCurrency(data.kpis.totalSales.amount)},${data.kpis.totalSales.changePercent}`,
    `Net Sales,${formatCurrency(data.kpis.netSales.amount)},${data.kpis.netSales.changePercent}`,
    `Online Sales,${formatCurrency(data.kpis.onlineSales.amount)},${data.kpis.onlineSales.changePercent}`,
    `Offline Sales,${formatCurrency(data.kpis.offlineSales.amount)},${data.kpis.offlineSales.changePercent}`,
    '',
    'Payment Method,Amount',
    ...data.paymentBreakdown.items.map(
      (item) => `${escapeCsv(item.label)},${formatCurrency(item.amount)}`,
    ),
    '',
    'Order Type,Sales,Orders',
    ...data.salesByOrderType.map(
      (row) => `${escapeCsv(row.label)},${formatCurrency(row.sales)},${row.orders}`,
    ),
    '',
    'Platform,Orders',
    ...data.onlineOrders.platforms.map((row) => `${escapeCsv(row.platform)},${row.orders}`),
  ];

  const blob = new Blob([sections.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'branch-sales-statistics.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

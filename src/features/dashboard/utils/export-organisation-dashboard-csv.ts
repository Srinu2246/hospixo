import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

export function exportOrganisationDashboardCsv(data: OrganisationDashboardOverview) {
  const headers = Object.values(organisationDashboardCopy.tableHeaders);
  const rows = data.performanceRows.map((row) =>
    [
      row.companyName,
      row.branches,
      row.revenue,
      row.orders,
      row.expenses,
      row.profit,
      row.status,
    ].join(','),
  );

  const blob = new Blob([[headers.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'all-companies-statistics.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { SummaryDonutCard } from '@/features/dashboard/components/company/summary-donut';
import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';
import { cn } from '@/lib/utils';

type OrganisationOperationsSummaryProps = Readonly<{
  taxSummary: OrganisationDashboardOverview['taxSummary'];
  financialBreakdown: OrganisationDashboardOverview['financialBreakdown'];
}>;

const stackClassMap = {
  cogs: orgDash.opsStackcogs,
  expenses: orgDash.opsStackexpenses,
  profit: orgDash.opsStackprofit,
  taxes: orgDash.opsStacktaxes,
} as const;

export function OrganisationOperationsSummary({
  taxSummary,
  financialBreakdown,
}: OrganisationOperationsSummaryProps) {
  return (
    <div>
      <h2 className={orgDash.opsSectiontitle}>
        {organisationDashboardCopy.operationsSummaryTitle}
      </h2>
      <div className={orgDash.opsGrid}>
        <SummaryDonutCard
          title={organisationDashboardCopy.taxSummaryTitle}
          total={taxSummary.total}
          items={taxSummary.items}
        />
        <section className={orgDash.surfaceCard}>
          <p className={orgDash.opsFinancialtitle}>
            {organisationDashboardCopy.financialBreakdownTitle}
          </p>
          <div className={orgDash.opsStackbar} aria-hidden>
            {financialBreakdown.map((slice) => (
              <span
                key={slice.id}
                className={stackClassMap[slice.tone]}
                style={{ width: `${slice.percent}%` }}
              />
            ))}
          </div>
          <ul className={orgDash.opsFinanciallist}>
            {financialBreakdown.map((slice) => (
              <li key={slice.id} className={orgDash.opsFinancialitem}>
                <span className={orgDash.opsFinanciallabel}>
                  <span className={cn(orgDash.opsFinancialswatch, stackClassMap[slice.tone])} />
                  {slice.label}
                </span>
                <strong>
                  {formatCurrency(slice.amount)} ({slice.percent}%)
                </strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

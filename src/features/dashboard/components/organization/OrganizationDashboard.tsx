'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import {
  formatCompactDashboardAmount,
  formatDashboardAmount,
  formatDashboardPercent,
  mapOrganizationCompanyPerformanceRows,
  mapOrganizationTaxSummary,
  mapOrganizationTopBranches,
} from '@/lib/helpers/organizationDashboardHelpers';
import { useOrganizationDashboard } from '@/lib/hooks/dashboard/useOrganizationDashboard';
import { formatIsoDate } from '@/lib/helpers/reportsOverview';
import {
  COMPANY_PERFORMANCE_ROWS,
  ORG_STAT_CARDS,
  ORG_TOP_BRANCHES,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { DashboardStatItem } from '../../types/dashboard.types';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { CompanyPerformanceTable } from './CompanyPerformanceTable';
import { OperationsSummarySection } from './OperationsSummarySection';
import { SubscriptionUsageCard } from './SubscriptionUsageCard';
import { TopPerformingBranchesCard } from './TopPerformingBranchesCard';

export interface OrganizationDashboardProps {
  organizationId?: number;
  /** Scope chip from dashboard header — filters API by company when not "All Companies". */
  selectedScope?: string;
  companies?: CompanyListItem[];
  dateFrom: Date;
  dateTo: Date;
}

export function OrganizationDashboard({
  organizationId,
  selectedScope = 'All Companies',
  companies,
  dateFrom,
  dateTo,
}: Readonly<OrganizationDashboardProps>) {
  const companyFilterId = useMemo(() => {
    if (!selectedScope || selectedScope === 'All Companies') return undefined;
    const company = companies?.find((item) => item.name === selectedScope);
    if (!company) return undefined;
    return Number(company.id);
  }, [companies, selectedScope]);

  const dashboard = useOrganizationDashboard(organizationId, {
    start_date: formatIsoDate(dateFrom),
    end_date: formatIsoDate(dateTo),
    company_id: companyFilterId,
    sort_by: 'total_sales',
    sort_order: 'desc',
    page: 1,
    page_size: 15,
  });

  const data = dashboard.data;

  const stats: DashboardStatItem[] = useMemo(() => {
    if (!data) return ORG_STAT_CARDS;
    const metricById: Record<
      string,
      { value: string; change?: number | null; subValue?: string } | undefined
    > = {
      'org-sales': {
        value: formatDashboardAmount(data.summary.total_sales),
        change: data.summary.total_sales_change_percent,
      },
      'org-net': {
        value: formatDashboardAmount(data.summary.net_sales),
        change: data.summary.net_sales_change_percent,
      },
      'org-companies': {
        value: `${data.summary.active_companies} Active`,
        subValue: `${data.summary.total_companies} Total`,
      },
      'org-branches': {
        value: `${data.summary.total_branches} Total`,
        subValue: `${data.summary.active_branches} Branches Active`,
      },
    };

    return ORG_STAT_CARDS.map((stat) => {
      const metric = metricById[stat.id];
      if (!metric) return stat;
      return {
        ...stat,
        value: metric.value,
        subValue: metric.subValue ?? stat.subValue,
        trend:
          metric.change != null
            ? {
                value: formatDashboardPercent(metric.change),
                isPositive: metric.change >= 0,
                periodText: 'vs yesterday',
              }
            : undefined,
      };
    });
  }, [data]);

  const performanceRows = useMemo(
    () =>
      data
        ? mapOrganizationCompanyPerformanceRows(data.company_performance.items)
        : COMPANY_PERFORMANCE_ROWS,
    [data],
  );

  const topBranches = useMemo(
    () => (data ? mapOrganizationTopBranches(data.top_performing_branches) : ORG_TOP_BRANCHES),
    [data],
  );

  const taxItems = useMemo(
    () => (data ? mapOrganizationTaxSummary(data.tax_summary) : undefined),
    [data],
  );

  if (typeof organizationId !== 'number') {
    return (
      <AlertMessage
        variant="warning"
        title="Organization required"
        message="Select an organization before viewing dashboard metrics."
      />
    );
  }

  if (dashboard.isLoading) {
    return <Loading message="Loading organization dashboard..." fullPage={false} />;
  }

  if (dashboard.isError) {
    return (
      <AlertMessage
        variant="error"
        title="Unable to load dashboard"
        message={
          dashboard.error instanceof Error
            ? dashboard.error.message
            : 'The organization dashboard request failed.'
        }
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      <CompanyPerformanceTable rows={performanceRows} />

      <OperationsSummarySection
        taxBreakdown={taxItems}
        taxTotal={data ? formatCompactDashboardAmount(data.tax_summary.total_tax) : undefined}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <TopPerformingBranchesCard branches={topBranches} />
        <SubscriptionUsageCard
          companiesUsed={data?.summary.total_companies}
          branchesUsed={data?.summary.total_branches}
        />
      </Box>
    </Box>
  );
}

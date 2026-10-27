'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import {
  buildOutletChartBars,
  formatCompactDashboardAmount,
  formatDashboardAmount,
  formatNullableDashboardAmount,
  formatDashboardPercent,
  mapBranchPerformanceToOutletRows,
  mapTaxSummaryToTaxItems,
} from '@/lib/helpers/companyDashboardHelpers';
import { formatIsoDate } from '@/lib/helpers/reportsOverview';
import { useCompanyDashboard } from '@/lib/hooks/dashboard/useCompanyDashboard';
import { COMPANY_STAT_CARDS } from '@/lib/mocks/dashboard/dashboard.mocks';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { DashboardStatItem } from '../../types/dashboard.types';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { CompanyOperationsSummary } from './CompanyOperationsSummary';
import { CustomerInsightsCard } from './CustomerInsightsCard';
import { RevenueForecastCard } from './RevenueForecastCard';
import { SalesByOutletSection } from './SalesByOutletSection';

export interface CompanyDashboardProps {
  companyId?: number;
  /** Scope chip from dashboard header — filters API by branch when not "All Branches". */
  selectedScope?: string;
  branches?: BranchListItem[];
  dateFrom: Date;
  dateTo: Date;
}

export function CompanyDashboard({
  companyId,
  selectedScope = 'All Branches',
  branches,
  dateFrom,
  dateTo,
}: Readonly<CompanyDashboardProps>) {
  const [outletTab, setOutletTab] = useState<'total' | 'top10'>('total');

  const branchFilterId = useMemo(() => {
    if (!selectedScope || selectedScope === 'All Branches') return undefined;
    return branches?.find((branch) => branch.name === selectedScope)?.id;
  }, [branches, selectedScope]);

  const dashboard = useCompanyDashboard(companyId, {
    start_date: formatIsoDate(dateFrom),
    end_date: formatIsoDate(dateTo),
    branch_id: branchFilterId,
    view: outletTab === 'top10' ? 'top10' : undefined,
    sort_by: 'total_sales',
    sort_order: 'desc',
    page: 1,
    page_size: 15,
  });

  const data = dashboard.data;

  const stats: DashboardStatItem[] = useMemo(() => {
    if (!data) return COMPANY_STAT_CARDS;
    const metricById: Record<
      string,
      { value: string; change?: number | null; subValue?: string } | undefined
    > = {
      'comp-total': {
        value: formatDashboardAmount(data.summary.total_sales),
        change: data.summary.total_sales_change_percent,
      },
      'comp-online': { value: formatNullableDashboardAmount(data.summary.online_sales) },
      'comp-offline': {
        value: formatDashboardAmount(data.summary.offline_sales),
        change: data.summary.offline_sales_change_percent,
      },
      'comp-branch': {
        value: `${data.summary.total_branches} Total`,
        subValue: `${data.summary.active_branches} Branches Active`,
      },
    };

    return COMPANY_STAT_CARDS.map((stat) => {
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

  const outletRows = useMemo(
    () => (data ? mapBranchPerformanceToOutletRows(data.branch_performance.items) : undefined),
    [data],
  );

  const outletChartBars = useMemo(
    () => (data ? buildOutletChartBars(data.branch_performance.items) : undefined),
    [data],
  );

  const taxItems = useMemo(
    () => (data ? mapTaxSummaryToTaxItems(data.tax_summary) : undefined),
    [data],
  );

  if (typeof companyId !== 'number') {
    return (
      <AlertMessage
        variant="warning"
        title="Company required"
        message="Select a company before viewing dashboard metrics."
      />
    );
  }

  if (dashboard.isLoading) {
    return <Loading message="Loading company dashboard..." fullPage={false} />;
  }

  if (dashboard.isError) {
    return (
      <AlertMessage
        variant="error"
        title="Unable to load dashboard"
        message={
          dashboard.error instanceof Error
            ? dashboard.error.message
            : 'The company dashboard request failed.'
        }
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      <SalesByOutletSection
        rows={outletRows}
        chartBars={outletChartBars}
        activeTab={outletTab}
        onActiveTabChange={setOutletTab}
      />

      <CompanyOperationsSummary
        taxBreakdown={taxItems}
        taxTotal={data ? formatCompactDashboardAmount(data.tax_summary.total_tax) : undefined}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <RevenueForecastCard />
        <CustomerInsightsCard
          averageOrderValue={
            data?.customer_insights.average_order_value != null
              ? formatDashboardAmount(data.customer_insights.average_order_value)
              : undefined
          }
          retentionRate={data?.customer_insights.retention_rate ?? undefined}
        />
      </Box>
    </Box>
  );
}

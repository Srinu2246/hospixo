'use client';

import { useState } from 'react';
import { Box } from '@mui/material';

import { CompanyFallbackBanner } from '@/features/dashboard/components/company/fallback-banner';
import { CustomerInsightsCard } from '@/features/dashboard/components/company/customer-insights';
import { ExpensesCard } from '@/features/dashboard/components/company/expenses';
import { CompanyDashboardHeader } from '@/features/dashboard/components/company/header';
import {
  KpiSummaryRow,
  type KpiSummaryItem,
} from '@/features/dashboard/components/company/kpi-summary';
import { LeakageTrackerCard } from '@/features/dashboard/components/company/leakage-tracker';
import { OperationsSummarySection } from '@/features/dashboard/components/company/operations-summary';
import { QuickHelpCard } from '@/features/dashboard/components/company/quick-help';
import { RevenueForecastCard } from '@/features/dashboard/components/company/revenue-forecast';
import { SalesByOutletSection } from '@/features/dashboard/components/company/sales-by-outlet';
import { companyLandingContent } from '@/features/dashboard/config/company';
import { useCompanyDashboardControls } from '@/features/dashboard/hooks/company-dashboard';
import type { DashboardMetric, DashboardOverview } from '@/features/dashboard/types';

type CompanyDashboardViewProps = Readonly<{
  data: DashboardOverview;
  source?: 'backend' | 'fallback';
  loadError?: string | null;
}>;

export function CompanyDashboardView({
  data: initialData,
  source = 'backend',
  loadError = null,
}: CompanyDashboardViewProps) {
  const controls = useCompanyDashboardControls(initialData);
  const displayData = controls.displayData;
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(null);

  function handleKpiSelect(key: string) {
    setSelectedKpiKey(key);
    requestAnimationFrame(() => {
      document.getElementById('sales-by-outlet')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  const kpiItems: KpiSummaryItem[] = companyLandingContent.kpiSummary.items.map((item) => {
    if (item.dataKey === 'branchStats') {
      return {
        kind: 'branch' as const,
        key: item.key,
        label: item.label,
        icon: item.icon as 'barChart',
        stats: displayData.branchStats,
      };
    }

    return {
      kind: 'metric' as const,
      key: item.key,
      label: item.label,
      icon: item.icon as 'lineChart' | 'globe' | 'banknote',
      metric: displayData.kpis[item.dataKey as keyof typeof displayData.kpis] as DashboardMetric,
    };
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto',
        minHeight: '100%',
        gap: 2.5,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc'),
        p: { xs: 2, sm: 2.5, md: 3 },
        boxSizing: 'border-box',
      }}
    >
      <CompanyDashboardHeader
        data={displayData}
        activeRange={controls.activeRange}
        customFrom={controls.customFrom}
        customTo={controls.customTo}
        dateMenuOpen={controls.dateMenuOpen}
        dateMenuRef={controls.dateMenuRef}
        onDateMenuToggle={controls.toggleDateMenu}
        onPresetRangeChange={controls.handlePresetRangeChange}
        onCustomRangeApply={controls.handleCustomRangeApply}
      />

      {source === 'fallback' ? <CompanyFallbackBanner detail={loadError} /> : null}

      <KpiSummaryRow items={kpiItems} selectedKey={selectedKpiKey} onSelect={handleKpiSelect} />

      <SalesByOutletSection rows={displayData.salesByOutlet} activeKpiKey={selectedKpiKey} />

      <OperationsSummarySection
        taxSummary={displayData.taxSummary}
        discountsSummary={displayData.discountsSummary}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        <RevenueForecastCard
          total={displayData.revenueForecast.total}
          confidence={displayData.revenueForecast.confidence}
          series={displayData.revenueForecast.series}
        />
        <CustomerInsightsCard
          newCustomerRate={displayData.customerInsights.newCustomerRate}
          averageOrderValue={displayData.customerInsights.averageOrderValue}
          aovChangePercent={displayData.customerInsights.aovChangePercent}
          peakHours={displayData.customerInsights.peakHours}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <ExpensesCard total={displayData.expenses.total} items={displayData.expenses.items} />
        <LeakageTrackerCard kots={displayData.leakage.kots} bills={displayData.leakage.bills} />
        <QuickHelpCard
          name={displayData.accountManager.name}
          phone={displayData.accountManager.phone}
          online={displayData.accountManager.online}
          supportId={displayData.accountManager.supportId}
          supportHours={displayData.accountManager.supportHours}
          supportMessage={displayData.accountManager.supportMessage}
        />
      </Box>
    </Box>
  );
}

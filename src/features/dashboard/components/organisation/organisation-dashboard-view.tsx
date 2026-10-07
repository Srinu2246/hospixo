'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';

import { CompanyFallbackBanner } from '@/features/dashboard/components/company/fallback-banner/index';
import { useOptionalDashboardData } from '@/context/dashboard-data';
import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { useOrganisationDashboardControls } from '@/features/dashboard/hooks/organisation-dashboard';
import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

import { CompanyPerformanceSection } from './company-performance-section';
import { OrganisationDashboardHeader } from './organisation-dashboard-header';
import { OrganisationKpiRow } from './organisation-kpi-row';
import { OrganisationOperationsSummary } from './organisation-operations-summary';
import { OrganisationBottomGrid } from './bottom-grid';

type OrganisationDashboardViewProps = Readonly<{
  data: OrganisationDashboardOverview;
  source?: 'backend' | 'fallback';
  loadError?: string | null;
}>;

export function OrganisationDashboardView({
  data: initialData,
  source = 'backend',
  loadError = null,
}: OrganisationDashboardViewProps) {
  const controls = useOrganisationDashboardControls(initialData);
  const data = controls.displayData;
  const dashboardContext = useOptionalDashboardData();

  const liveBranchCount = useMemo(() => {
    const outlets = dashboardContext?.data?.outlets?.filter((outlet) => outlet.id !== 'all') ?? [];
    return outlets.length;
  }, [dashboardContext?.data?.outlets]);

  const kpis = useMemo(() => {
    if (liveBranchCount <= 0) return data.kpis;
    return data.kpis.map((kpi) => {
      if (kpi.id === 'branches' && (kpi.value === '0' || !kpi.value)) {
        return {
          ...kpi,
          value: String(liveBranchCount),
          helperText: 'Total',
        };
      }
      return kpi;
    });
  }, [data.kpis, liveBranchCount]);

  const activeMetricLabel =
    organisationDashboardCopy.metricOptions.find((option) => option.id === controls.activeMetric)
      ?.label ?? 'Total Sales';

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
      <OrganisationDashboardHeader
        data={data}
        activeRange={controls.activeRange}
        customFrom={controls.customFrom}
        customTo={controls.customTo}
        dateMenuOpen={controls.dateMenuOpen && controls.dateMenuSource === 'header'}
        dateMenuRef={controls.headerDateMenuRef}
        onDateMenuToggle={() => controls.toggleDateMenu('header')}
        onPresetRangeChange={controls.handlePresetRangeChange}
        onCustomRangeApply={controls.handleCustomRangeApply}
      />

      {source === 'fallback' && loadError ? <CompanyFallbackBanner detail={loadError} /> : null}

      <OrganisationKpiRow
        kpis={kpis}
        selectedId={controls.selectedKpiId}
        onSelect={controls.handleKpiSelect}
      />

      <CompanyPerformanceSection
        dateRangeLabel={data.dateRangeLabel}
        activeRange={controls.activeRange}
        customFrom={controls.customFrom}
        customTo={controls.customTo}
        dateMenuOpen={controls.dateMenuOpen && controls.dateMenuSource === 'performance'}
        dateMenuRef={controls.performanceDateMenuRef}
        onDateMenuToggle={() => controls.toggleDateMenu('performance')}
        onPresetRangeChange={controls.handlePresetRangeChange}
        onCustomRangeApply={controls.handleCustomRangeApply}
        activeMetric={controls.activeMetric}
        activeMetricLabel={activeMetricLabel}
        viewMode={controls.viewMode}
        metricMenuOpen={controls.metricMenuOpen}
        metricMenuRef={controls.metricMenuRef}
        companySeries={data.companySeries}
        allPerformanceRows={data.allPerformanceRows}
        performanceRows={data.performanceRows}
        maxChartValue={controls.maxChartValue}
        currentPage={controls.currentPage}
        totalPages={controls.totalPages}
        onMetricMenuToggle={() => controls.setMetricMenuOpen((open) => !open)}
        onMetricChange={controls.handleMetricChange}
        onViewChange={controls.handleViewChange}
        onCompareCompanies={controls.handleCompareCompanies}
        onPageChange={controls.handlePageChange}
      />

      <OrganisationOperationsSummary
        taxSummary={data.taxSummary}
        financialBreakdown={data.financialBreakdown}
      />

      <OrganisationBottomGrid
        data={data}
        expandedInsightId={controls.expandedInsightId}
        onToggleInsight={(insightId) =>
          controls.setExpandedInsightId((current) => (current === insightId ? null : insightId))
        }
      />
    </Box>
  );
}

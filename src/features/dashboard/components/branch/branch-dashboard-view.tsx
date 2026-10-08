'use client';

import { useState } from 'react';
import { Box } from '@mui/material';

import { CompanyFallbackBanner } from '@/features/dashboard/components/company/fallback-banner';
import {
  KpiSummaryRow,
  type KpiSummaryItem,
} from '@/features/dashboard/components/company/kpi-summary';
import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import { useBranchDashboardControls } from '@/features/dashboard/hooks/branch-dashboard';
import type { BranchDashboardOverview } from '@/features/dashboard/types/branch-dashboard';

import { BranchExpensesCard } from './expenses';
import { BranchDashboardHeader } from './header';
import { BranchLeakageCard } from './leakage';
import { LowStockAlertBanner } from './low-stock-alert';
import { OrderTypeSummaryRow } from './order-type-summary';
import { BranchQuickHelpCard } from './quick-help';
import { SalesStatisticsSection } from './sales-statistics';

type BranchDashboardViewProps = Readonly<{
  data: BranchDashboardOverview;
  source?: 'backend' | 'fallback';
  loadError?: string | null;
}>;

export function BranchDashboardView({
  data: initialData,
  source = 'backend',
  loadError = null,
}: BranchDashboardViewProps) {
  const controls = useBranchDashboardControls(initialData);
  const data = controls.displayData;
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(null);

  function handleKpiSelect(key: string) {
    setSelectedKpiKey(key);
    requestAnimationFrame(() => {
      const targetId =
        key === 'online'
          ? 'online-orders'
          : key === 'offline'
            ? 'sales-breakdown'
            : 'sales-statistics';
      const el = document.getElementById(targetId) ?? document.getElementById('sales-statistics');
      el?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  const kpiItems: KpiSummaryItem[] = [
    {
      kind: 'metric',
      key: 'total',
      label: 'Total Sales',
      icon: 'lineChart',
      metric: data.kpis.totalSales,
    },
    {
      kind: 'metric',
      key: 'net',
      label: 'Net Sales',
      icon: 'barChart',
      metric: data.kpis.netSales,
    },
    {
      kind: 'metric',
      key: 'online',
      label: 'Online Sales',
      icon: 'globe',
      metric: data.kpis.onlineSales,
    },
    {
      kind: 'metric',
      key: 'offline',
      label: 'Offline Sales',
      icon: 'banknote',
      metric: data.kpis.offlineSales,
    },
  ];

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
      <BranchDashboardHeader
        data={data}
        activeRange={controls.activeRange}
        customFrom={controls.customFrom}
        customTo={controls.customTo}
        dateMenuOpen={controls.dateMenuOpen}
        dateMenuRef={controls.headerDateMenuRef}
        onDateMenuToggle={controls.toggleHeaderDateMenu}
        onPresetRangeChange={controls.handlePresetRangeChange}
        onCustomRangeApply={controls.handleCustomRangeApply}
      />

      {source === 'fallback' ? (
        <CompanyFallbackBanner detail={loadError ?? branchDashboardCopy.fallback.banner} />
      ) : null}

      <LowStockAlertBanner
        lowCount={data.lowStockAlert.lowCount}
        outOfStockCount={data.lowStockAlert.outOfStockCount}
        inventoryHref={data.lowStockAlert.inventoryHref}
      />

      <KpiSummaryRow items={kpiItems} selectedKey={selectedKpiKey} onSelect={handleKpiSelect} />

      <SalesStatisticsSection
        data={data}
        activeRange={controls.activeRange}
        customFrom={controls.customFrom}
        customTo={controls.customTo}
        dateMenuOpen={controls.salesDateMenuOpen}
        dateMenuRef={controls.salesDateMenuRef}
        salesPeriod={controls.salesPeriod}
        onlineOrdersPeriod={controls.onlineOrdersPeriod}
        onDateMenuToggle={controls.toggleSalesDateMenu}
        onPresetRangeChange={controls.handlePresetRangeChange}
        onCustomRangeApply={controls.handleCustomRangeApply}
        onSalesPeriodChange={controls.handleSalesPeriodChange}
        onOnlineOrdersPeriodChange={controls.handleOnlineOrdersPeriodChange}
        onRefresh={controls.handleRefreshSalesStatistics}
        isRefreshing={controls.isSalesRefreshing}
      />

      <OrderTypeSummaryRow items={data.orderTypeSummary} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <BranchExpensesCard
          expenses={data.expenses}
          period={controls.expensesPeriod}
          onPeriodChange={controls.handleExpensesPeriodChange}
        />
        <BranchLeakageCard kots={data.leakage.kots} bills={data.leakage.bills} />
        <BranchQuickHelpCard
          name={data.accountManager.name}
          role={data.accountManager.role}
          phone={data.accountManager.phone}
          online={data.accountManager.online}
          outletId={data.accountManager.outletId}
          supportHours={data.accountManager.supportHours}
          supportMessage={data.accountManager.supportMessage}
        />
      </Box>
    </Box>
  );
}

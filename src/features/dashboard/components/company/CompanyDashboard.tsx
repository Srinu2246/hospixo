'use client';

import Box from '@mui/material/Box';

import { COMPANY_STAT_CARDS } from '@/lib/mocks/dashboard/dashboard.mocks';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { DashboardStatItem } from '../../types/dashboard.types';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { CompanyOperationsSummary } from './CompanyOperationsSummary';
import { CustomerInsightsCard } from './CustomerInsightsCard';
import { RevenueForecastCard } from './RevenueForecastCard';
import { SalesByOutletSection } from './SalesByOutletSection';

/**
 * Branches come from the API. Sales and the other cards have no endpoint yet,
 * so they stay on mock data.
 */
export function CompanyDashboard({
  branches,
  isLoading = false,
}: Readonly<{ branches?: BranchListItem[]; isLoading?: boolean }> = {}) {
  const rows = branches ?? [];
  const hasLiveData = !isLoading && rows.length > 0;
  const activeBranches = rows.filter((branch) => branch.status === 'active').length;

  const stats: DashboardStatItem[] = COMPANY_STAT_CARDS.map((stat) =>
    hasLiveData && stat.id === 'comp-branch'
      ? { ...stat, value: `${rows.length} Total`, subValue: `${activeBranches} Branches Active` }
      : stat,
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      {/* 1. Top 4 Stat Cards */}
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

      {/* 3. Sales by Outlet (Bar Chart / Table View) */}
      <SalesByOutletSection />

      {/* 4. Operations Summary (Tax Donut + Discounts Donut) */}
      <CompanyOperationsSummary />

      {/* 5. Middle Row: Revenue Forecast (50%) + Customer Insights (50%) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <RevenueForecastCard />
        <CustomerInsightsCard />
      </Box>
    </Box>
  );
}

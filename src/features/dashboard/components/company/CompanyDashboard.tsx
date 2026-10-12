'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { COMPANY_STAT_CARDS } from '@/lib/mocks/dashboard/dashboard.mocks';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { SalesByOutletSection } from './SalesByOutletSection';
import { CompanyOperationsSummary } from './CompanyOperationsSummary';
import { RevenueForecastCard } from './RevenueForecastCard';
import { CustomerInsightsCard } from './CustomerInsightsCard';
import { TodaysExpensesCard } from './TodaysExpensesCard';
import { LeakageTrackerCard } from './LeakageTrackerCard';
import { QuickHelpCard } from '../shared/QuickHelpCard';

export function CompanyDashboard() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      {/* 1. Top 4 Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {COMPANY_STAT_CARDS.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      {/* 2. Sales by Outlet (Bar Chart / Table View) */}
      <SalesByOutletSection />

      {/* 3. Operations Summary (Tax Donut + Discounts Donut) */}
      <CompanyOperationsSummary />

      {/* 4. Middle Row: Revenue Forecast (50%) + Customer Insights (50%) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <RevenueForecastCard />
        <CustomerInsightsCard />
      </Box>

      {/* 5. Bottom Row: 3 Columns (Today's Expenses, Leakage Tracker, Quick Help) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        <TodaysExpensesCard />
        <LeakageTrackerCard />
        <QuickHelpCard />
      </Box>
    </Box>
  );
}

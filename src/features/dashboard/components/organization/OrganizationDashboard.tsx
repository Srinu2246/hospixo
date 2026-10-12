'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { ORG_STAT_CARDS } from '@/lib/mocks/dashboard/dashboard.mocks';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { CompanyPerformanceTable } from './CompanyPerformanceTable';
import { OperationsSummarySection } from './OperationsSummarySection';
import { TopPerformingBranchesCard } from './TopPerformingBranchesCard';
import { SubscriptionUsageCard } from './SubscriptionUsageCard';
import { NeedsAttentionCard } from './NeedsAttentionCard';
import { AiBusinessInsightsCard } from './AiBusinessInsightsCard';
import { QuickHelpCard } from '../shared/QuickHelpCard';

export function OrganizationDashboard() {
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
        {ORG_STAT_CARDS.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      {/* 2. Company Performance (Table / Bar Chart View) */}
      <CompanyPerformanceTable />

      {/* 3. Operations Summary (Tax Donut + Financial Breakdown) */}
      <OperationsSummarySection />

      {/* 4. Middle Row: Top Branches (50%) + Subscription & Usage (50%) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <TopPerformingBranchesCard />
        <SubscriptionUsageCard />
      </Box>

      {/* 5. Bottom Row: 3 Columns (Needs Attention, AI Insights, Quick Help) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1.3fr 1fr' },
          gap: 2.5,
        }}
      >
        <NeedsAttentionCard />
        <AiBusinessInsightsCard />
        <QuickHelpCard />
      </Box>
    </Box>
  );
}

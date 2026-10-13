'use client';

import React from 'react';
import Box from '@mui/material/Box';

import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import {
  COMPANY_PERFORMANCE_ROWS,
  ORG_STAT_CARDS,
  ORG_TOP_BRANCHES,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type {
  CompanyPerformanceRow,
  DashboardStatItem,
  TopPerformingBranch,
} from '../../types/dashboard.types';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { QuickHelpCard } from '../shared/QuickHelpCard';
import { AiBusinessInsightsCard } from './AiBusinessInsightsCard';
import { CompanyPerformanceTable } from './CompanyPerformanceTable';
import { NeedsAttentionCard } from './NeedsAttentionCard';
import { OperationsSummarySection } from './OperationsSummarySection';
import { SubscriptionUsageCard } from './SubscriptionUsageCard';
import { TopPerformingBranchesCard } from './TopPerformingBranchesCard';

export interface OrganizationDashboardProps {
  /** Companies from GET /v2/platform/organizations/{org}/companies. */
  companies?: CompanyListItem[];
  /** Branches from each company's branches endpoint. */
  branches?: BranchListItem[];
  isLoading?: boolean;
}

/**
 * Companies and branches come from the API. Sales, revenue and the other cards
 * have no endpoint yet, so they stay on mock data.
 */
export function OrganizationDashboard({
  companies = [],
  branches = [],
  isLoading = false,
}: Readonly<OrganizationDashboardProps> = {}) {
  const hasLiveData = !isLoading && companies.length > 0;
  const activeCompanies = companies.filter((company) => company.status === 'active').length;
  const activeBranches = branches.filter((branch) => branch.status === 'active').length;

  const stats: DashboardStatItem[] = ORG_STAT_CARDS.map((stat) => {
    if (!hasLiveData) return stat;
    if (stat.id === 'org-companies') {
      return { ...stat, value: `${activeCompanies} Active`, subValue: `${companies.length} Total` };
    }
    if (stat.id === 'org-branches') {
      return { ...stat, value: `${branches.length} Total`, subValue: `${activeBranches} Active` };
    }
    return stat;
  });

  const performanceRows: CompanyPerformanceRow[] = hasLiveData
    ? companies.map((company, index) => {
        const mock = COMPANY_PERFORMANCE_ROWS[index % COMPANY_PERFORMANCE_ROWS.length];
        return {
          ...mock,
          id: String(company.id),
          companyName: company.name,
          branches: branches.filter((branch) => String(branch.companyId) === String(company.id))
            .length,
          status: company.status === 'inactive' ? 'inactive' : 'active',
        };
      })
    : COMPANY_PERFORMANCE_ROWS;

  const topBranches: TopPerformingBranch[] =
    hasLiveData && branches.length > 0
      ? branches.slice(0, ORG_TOP_BRANCHES.length).map((branch, index) => ({
          ...ORG_TOP_BRANCHES[index],
          name: branch.name,
          companyName:
            companies.find((company) => String(company.id) === String(branch.companyId))?.name ??
            ORG_TOP_BRANCHES[index].companyName,
        }))
      : ORG_TOP_BRANCHES;

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
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      {/* 2. Company Performance (Table / Bar Chart View) */}
      <CompanyPerformanceTable rows={performanceRows} />

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
        <TopPerformingBranchesCard branches={topBranches} />
        <SubscriptionUsageCard
          companiesUsed={hasLiveData ? companies.length : undefined}
          branchesUsed={hasLiveData ? branches.length : undefined}
        />
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

export function BranchDirectory({
  branches = [],
  isLoading = false,
}: Readonly<{ branches?: BranchListItem[]; isLoading?: boolean }>) {
  const columns: readonly DataGridColumn<BranchListItem>[] = [
    { field: 'name', headerName: 'Branch', minWidth: 220 },
    {
      field: 'city',
      headerName: 'City',
      minWidth: 140,
      renderCell: ({ row }) => row.city || '—',
    },
    {
      field: 'code',
      headerName: 'Code',
      minWidth: 120,
      renderCell: ({ row }) => row.code || '—',
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip
          status={row.status}
          label={row.status === 'active' ? 'Active' : 'Inactive'}
          variantType={row.status === 'active' ? 'success' : 'default'}
        />
      ),
    },
  ];

  return (
    <DataGrid
      columns={columns}
      rows={branches}
      getRowId={(row) => String(row.id)}
      loading={isLoading}
      emptyTitle="No branches found"
      emptySubtitle="The branches API did not return any outlets."
      ariaLabel="Branches"
      pagination
      paginationEntityName="branches"
    />
  );
}

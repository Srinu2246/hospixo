'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import type { CompanyPerformanceRow, DashboardStatItem } from '../../types/dashboard.types';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { CompanyPerformanceTable } from './CompanyPerformanceTable';
import { TopPerformingBranchesCard } from './TopPerformingBranchesCard';

export interface OrganizationDashboardProps {
  /** Companies from GET /v1/platform/organizations/{org}/companies. */
  companies?: CompanyListItem[];
  /** Branches from each company's branches endpoint. */
  branches?: BranchListItem[];
  isLoading?: boolean;
}

export function OrganizationDashboard({
  companies = [],
  branches = [],
  isLoading = false,
}: Readonly<OrganizationDashboardProps> = {}) {
  const activeCompanies = companies.filter((company) => company.status === 'active').length;
  const stats: DashboardStatItem[] = [
    {
      id: 'org-companies',
      label: 'COMPANIES',
      value: `${activeCompanies} Active`,
      subValue: `${companies.length} Total`,
      iconType: 'companies',
    },
    {
      id: 'org-branches',
      label: 'BRANCHES',
      value: `${branches.length} Total`,
      subValue: `${branches.filter((branch) => branch.status === 'active').length} Active`,
      iconType: 'branches',
    },
  ];
  const performanceRows: CompanyPerformanceRow[] = companies.map((company) => ({
    id: String(company.id),
    companyName: company.name,
    branches: branches.filter((branch) => String(branch.companyId) === String(company.id)).length,
    revenue: '—',
    revenueNumeric: 0,
    orders: '—',
    expenses: '—',
    profit: '—',
    isProfitPositive: true,
    status: company.status === 'inactive' ? 'inactive' : 'active',
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      <CompanyPerformanceTable rows={performanceRows} />

      <TopPerformingBranchesCard
        branches={branches.slice(0, 5).map((branch, index) => ({
          rank: index + 1,
          name: branch.name,
          companyName:
            companies.find((company) => String(company.id) === String(branch.companyId))?.name ??
            'Company',
          revenue: '—',
        }))}
      />

      {!isLoading && companies.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>No companies returned by the API.</Typography>
      ) : null}
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

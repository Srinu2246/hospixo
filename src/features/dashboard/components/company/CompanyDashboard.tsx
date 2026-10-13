'use client';

import Box from '@mui/material/Box';

import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import type { DashboardStatItem } from '../../types/dashboard.types';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { BranchDirectory } from '../organization/OrganizationDashboard';

export function CompanyDashboard({
  branches,
  isLoading = false,
}: Readonly<{ branches?: BranchListItem[]; isLoading?: boolean }> = {}) {
  const rows = branches ?? [];
  const activeBranches = rows.filter((branch) => branch.status === 'active').length;
  const stats: DashboardStatItem[] = [
    {
      id: 'comp-branch',
      label: 'BRANCHES',
      value: `${rows.length} Total`,
      subValue: `${activeBranches} Active`,
      iconType: 'branches',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
        {stats.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>
      <BranchDirectory branches={rows} isLoading={isLoading} />
    </Box>
  );
}

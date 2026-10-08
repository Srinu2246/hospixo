'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Chip, TableCell, TableRow, Typography } from '@mui/material';
import { MapPin, Store } from 'lucide-react';

import {
  EntityDashboardButton,
  EntityIdentityCell,
  EntityListPageLayout,
  EntityListMetricsRow,
  EntityListToolbar,
  EntityStatusChip,
  EntityTable,
  type EntityTableColumn,
  type StatusFilterTab,
} from '@/components/common/entity-list';
import { useBranchesList } from '../hooks/use-branches-list';
import type { BranchListItem } from '../types';

type StatusFilter = StatusFilterTab;

type BranchesListPageProps = Readonly<{
  companyId?: string;
  scope?: 'organisation' | 'company';
}>;

const BRANCH_TABLE_COLUMNS: readonly EntityTableColumn[] = [
  { label: 'Branch' },
  { label: 'Company' },
  { label: 'Location / City' },
  { label: 'Status' },
  { label: 'Action', align: 'center' },
];

export function BranchesListPage({
  companyId,
  scope = 'organisation',
}: BranchesListPageProps = {}) {
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBranchesList(companyId, scope);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const metrics = useMemo(() => {
    const total = branches.length;
    const active = branches.filter((b) => b.status === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [branches]);

  const filteredBranches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return branches.filter((branch) => {
      if (statusFilter !== 'all' && branch.status !== statusFilter) {
        return false;
      }
      if (query) {
        const matchesName = branch.name.toLowerCase().includes(query);
        const matchesCode = branch.code?.toLowerCase().includes(query);
        const matchesCity = branch.city?.toLowerCase().includes(query);
        const matchesCompany = branch.companyName?.toLowerCase().includes(query);
        return matchesName || matchesCode || matchesCity || matchesCompany;
      }
      return true;
    });
  }, [branches, searchQuery, statusFilter]);

  const breadcrumbPrefix = scope === 'company' ? 'Company · Branches' : 'Organisation · Branches';

  return (
    <EntityListPageLayout
      breadcrumb={breadcrumbPrefix}
      title="All Branches"
      subtitle="Overview of all branch locations and their operational statuses"
      onRefresh={() => void refetch()}
      error={
        isError ? (error instanceof Error ? error.message : 'Unable to load branches list.') : null
      }
    >
      <EntityListMetricsRow
        metrics={metrics}
        totalLabel="Total Branches"
        activeLabel="Active Branches"
        inactiveLabel="Inactive Branches"
        totalIcon={Store}
        isLoading={isLoading}
      />

      <EntityListToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search branches by name, code, or city..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={{
          all: metrics.total,
          active: metrics.active,
          inactive: metrics.inactive,
        }}
      />

      <EntityTable
        columns={BRANCH_TABLE_COLUMNS}
        isLoading={isLoading}
        isEmpty={filteredBranches.length === 0}
        emptyIcon={Store}
        emptyTitle="No branches found"
        emptySubtitle={
          searchQuery
            ? 'Try adjusting your search criteria.'
            : 'No branches are currently registered.'
        }
      >
        {filteredBranches.map((branch) => (
          <BranchRow key={branch.id} branch={branch} />
        ))}
      </EntityTable>
    </EntityListPageLayout>
  );
}

function BranchRow({ branch }: Readonly<{ branch: BranchListItem }>) {
  const router = useRouter();
  const branchParams = new URLSearchParams({ outlet: String(branch.id) });
  if (branch.companyId) {
    branchParams.set('company_id', String(branch.companyId));
  }
  const branchDashboardHref = `/branch?${branchParams.toString()}`;

  const defaultBadge = branch.isDefault ? (
    <Chip
      label="Default"
      size="small"
      sx={{
        height: 18,
        fontSize: '0.625rem',
        fontWeight: 700,
        borderRadius: '9999px',
        bgcolor: 'action.selected',
      }}
    />
  ) : null;

  return (
    <TableRow
      hover
      onClick={() => router.push(branchDashboardHref)}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <TableCell sx={{ py: 1, px: 1.5 }}>
        <EntityIdentityCell
          icon={Store}
          name={branch.name}
          href={branchDashboardHref}
          code={branch.code}
          badge={defaultBadge}
        />
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {branch.companyName ?? (branch.companyId ? `Company #${branch.companyId}` : '—')}
        </Typography>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          <MapPin size={14} />
          <span>{branch.city ?? 'Not specified'}</span>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <EntityStatusChip status={branch.status} />
      </TableCell>

      <TableCell align="center" sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <EntityDashboardButton href={branchDashboardHref} />
      </TableCell>
    </TableRow>
  );
}

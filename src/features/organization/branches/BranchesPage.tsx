'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { MapPin, Store } from 'lucide-react';

import {
  EntityDashboardButton,
  EntityIdentityCell,
  EntityListMetricsRow,
  EntityListPageLayout,
  EntityListToolbar,
  EntityStatusChip,
  EntityTable,
  type EntityStatusFilter,
  type EntityTableColumn,
} from '@/components/shared/entity-list';
import { useOrganizationBranches } from '@/lib/hooks/organization/branches/useOrganizationBranches';
import type { BranchListItem } from '@/lib/schemas/organization/branches/branchListSchema';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface BranchesPageProps {
  /** Organization lists every company's branches. Company lists one company's outlets. */
  scope?: 'organization' | 'company';
  /** Branches loaded on the server for the first paint. */
  initialBranches?: BranchListItem[];
  /** Organisation id from the login session. */
  organizationId?: number;
  /** Company whose outlets are listed. Falls back to the sidebar company. */
  companyId?: number;
}

const COLUMNS: readonly EntityTableColumn[] = [
  { label: 'Branch' },
  { label: 'Company' },
  { label: 'Location / City' },
  { label: 'Status' },
  { label: 'Action', align: 'center' },
];

/**
 * All Branches
 * 1. Header with Refresh
 * 2. Total, active, inactive counts
 * 3. Search and status filter
 * 4. Branch table. A row opens that branch's dashboard.
 */
export function BranchesPage({
  scope = 'organization',
  initialBranches,
  organizationId,
  companyId,
}: Readonly<BranchesPageProps> = {}) {
  const router = useRouter();
  const setContext = useSidebarStore((state) => state.setContext);
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const contextCompanyId = useSidebarStore((state) => state.context.companyId);
  const orgId = organizationId ?? accountOrgId;
  const scopedCompanyId = scope === 'company' ? (companyId ?? contextCompanyId) : undefined;
  const branches = useOrganizationBranches(orgId, scopedCompanyId, initialBranches);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatusFilter>('all');

  const rows = useMemo(() => branches.data ?? [], [branches.data]);
  const counts = useMemo(() => {
    const active = rows.filter((branch) => branch.status === 'active').length;
    return { all: rows.length, active, inactive: rows.length - active };
  }, [rows]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((branch) => {
      if (statusFilter !== 'all' && branch.status !== statusFilter) return false;
      if (!query) return true;
      return [branch.name, branch.code, branch.city, branch.companyName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [rows, search, statusFilter]);

  const openBranch = (branch: BranchListItem) => {
    setContext({
      organizationId: orgId,
      companyId: toNumber(branch.companyId),
      companyName: branch.companyName ?? undefined,
      branchId: toNumber(branch.id),
      branchName: branch.name,
      branchSlug: branch.code ?? undefined,
    });
    router.push('/branch-manager/dashboard?level=branch');
  };

  const errorMessage = branches.isError
    ? branches.error instanceof Error
      ? branches.error.message
      : 'Unable to load branches list.'
    : null;

  return (
    <EntityListPageLayout
      breadcrumb={scope === 'company' ? 'Company · Branches' : 'Organisation · Branches'}
      title="All Branches"
      subtitle="Overview of all branch locations and their operational statuses"
      onRefresh={() => void branches.refetch()}
      error={errorMessage}
    >
      <EntityListMetricsRow
        metrics={{ total: counts.all, active: counts.active, inactive: counts.inactive }}
        totalLabel="Total Branches"
        activeLabel="Active Branches"
        inactiveLabel="Inactive Branches"
        totalIcon={Store}
        isLoading={branches.isLoading}
      />

      <EntityListToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branches by name, code, or city..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
      />

      <EntityTable
        columns={COLUMNS}
        isLoading={branches.isLoading}
        isEmpty={visibleRows.length === 0}
        emptyIcon={Store}
        emptyTitle="No branches found"
        emptySubtitle={
          search ? 'Try adjusting your search criteria.' : 'No branches are currently registered.'
        }
      >
        {visibleRows.map((branch) => (
          <BranchRow key={String(branch.id)} branch={branch} onOpen={openBranch} />
        ))}
      </EntityTable>
    </EntityListPageLayout>
  );
}

function BranchRow({
  branch,
  onOpen,
}: Readonly<{ branch: BranchListItem; onOpen: (branch: BranchListItem) => void }>) {
  return (
    <TableRow
      hover
      onClick={() => onOpen(branch)}
      sx={{
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:last-child td, &:last-child th': { border: 0 },
      }}
    >
      <TableCell sx={{ py: 1, px: 1.5 }}>
        <EntityIdentityCell
          icon={Store}
          name={branch.name}
          code={branch.code}
          badge={
            branch.isDefault ? (
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
            ) : null
          }
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
        <EntityDashboardButton onClick={() => onOpen(branch)} />
      </TableCell>
    </TableRow>
  );
}

function toNumber(value: number | string): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

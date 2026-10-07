'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Chip, TableCell, TableRow, Typography } from '@mui/material';
import { Building2, Store, Users } from 'lucide-react';

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
import { useCompaniesList } from '../hooks/use-companies-list';
import type { CompanyListItem } from '../types';

type StatusFilter = StatusFilterTab;

const COMPANY_TABLE_COLUMNS: readonly EntityTableColumn[] = [
  { label: 'Company' },
  { label: 'Business Type' },
  { label: 'Branches' },
  { label: 'Users' },
  { label: 'Status' },
  { label: 'Action', align: 'center' },
];

export function CompaniesListPage() {
  const { data: companies = [], isLoading, isError, error, refetch } = useCompaniesList();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const metrics = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.status === 'active').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return companies.filter((company) => {
      if (statusFilter !== 'all' && company.status !== statusFilter) {
        return false;
      }
      if (query) {
        const matchesName = company.name.toLowerCase().includes(query);
        const matchesCode = company.code?.toLowerCase().includes(query);
        const matchesType = company.businessType?.toLowerCase().includes(query);
        return matchesName || matchesCode || matchesType;
      }
      return true;
    });
  }, [companies, searchQuery, statusFilter]);

  return (
    <EntityListPageLayout
      breadcrumb="Organisation · Companies"
      title="All Companies"
      subtitle="Overview of all registered companies and their operational footprint"
      onRefresh={() => void refetch()}
      error={
        isError ? (error instanceof Error ? error.message : 'Unable to load companies list.') : null
      }
    >
      <EntityListMetricsRow
        metrics={metrics}
        totalLabel="Total Companies"
        activeLabel="Active Companies"
        inactiveLabel="Inactive Companies"
        totalIcon={Building2}
        isLoading={isLoading}
      />

      <EntityListToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search companies by name, code, or type..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={{
          all: metrics.total,
          active: metrics.active,
          inactive: metrics.inactive,
        }}
      />

      <EntityTable
        columns={COMPANY_TABLE_COLUMNS}
        isLoading={isLoading}
        isEmpty={filteredCompanies.length === 0}
        emptyIcon={Building2}
        emptyTitle="No companies found"
        emptySubtitle={
          searchQuery
            ? 'Try adjusting your search criteria.'
            : 'No companies are currently registered.'
        }
      >
        {filteredCompanies.map((company) => (
          <CompanyRow key={company.id} company={company} />
        ))}
      </EntityTable>
    </EntityListPageLayout>
  );
}

function CompanyRow({ company }: Readonly<{ company: CompanyListItem }>) {
  const router = useRouter();
  const companyDashboardHref = `/company?company_id=${encodeURIComponent(String(company.id))}`;

  return (
    <TableRow
      hover
      onClick={() => router.push(companyDashboardHref)}
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        transition: 'background-color 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <TableCell sx={{ py: 1, px: 1.5 }}>
        <EntityIdentityCell
          icon={Building2}
          name={company.name}
          href={companyDashboardHref}
          code={company.code}
        />
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {company.businessType ?? 'Hospitality'}
        </Typography>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Chip
          component={Link}
          href={companyDashboardHref}
          onClick={(e) => {
            e.stopPropagation();
          }}
          clickable
          icon={<Store size={13} />}
          label={`${company.branchCount} branches`}
          size="small"
          sx={{
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: 'action.hover',
            borderColor: 'divider',
            borderWidth: 1,
            borderStyle: 'solid',
            '&:hover': {
              bgcolor: 'action.selected',
            },
          }}
        />
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
          <Users size={14} />
          <span>{company.userCount}</span>
        </Box>
      </TableCell>

      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <EntityStatusChip status={company.status} />
      </TableCell>

      <TableCell align="center" sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <EntityDashboardButton href={companyDashboardHref} />
      </TableCell>
    </TableRow>
  );
}

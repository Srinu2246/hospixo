'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Building2, Store, Users } from 'lucide-react';

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
import { useOrganizationCompanies } from '@/lib/hooks/organization/companies/useOrganizationCompanies';
import { companyDashboardHref } from '@/lib/helpers';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface CompaniesPageProps {
  /** Companies loaded on the server for the signed-in organisation. */
  initialCompanies?: CompanyListItem[];
  /** Organisation id from the login session. */
  organizationId?: number;
}

const COLUMNS: readonly EntityTableColumn[] = [
  { label: 'Company' },
  { label: 'Business Type' },
  { label: 'Branches' },
  { label: 'Users' },
  { label: 'Status' },
  { label: 'Action', align: 'center' },
];

/**
 * All Companies
 * 1. Header with Refresh
 * 2. Total, active, inactive counts
 * 3. Search and status filter
 * 4. Company table. A row opens that company's dashboard.
 */
export function CompaniesPage({
  initialCompanies,
  organizationId,
}: Readonly<CompaniesPageProps> = {}) {
  const router = useRouter();
  const setContext = useSidebarStore((state) => state.setContext);
  const sidebarContext = useSidebarStore((state) => state.context);
  const role = useSidebarStore((state) => state.role);
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const orgId = organizationId ?? accountOrgId;
  const companies = useOrganizationCompanies(orgId, initialCompanies);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatusFilter>('all');

  const rows = useMemo(() => companies.data ?? [], [companies.data]);
  const counts = useMemo(() => {
    const active = rows.filter((company) => company.status === 'active').length;
    return { all: rows.length, active, inactive: rows.length - active };
  }, [rows]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((company) => {
      if (statusFilter !== 'all' && company.status !== statusFilter) return false;
      if (!query) return true;
      return [company.name, company.code, company.businessType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [rows, search, statusFilter]);

  const openCompany = (company: CompanyListItem) => {
    const numericId = typeof company.id === 'number' ? company.id : Number(company.id);
    const nextContext = {
      ...sidebarContext,
      organizationId: orgId,
      companyId: Number.isFinite(numericId) ? numericId : undefined,
      companyName: company.name,
      companySlug: company.code?.trim() || company.name,
    };
    setContext(nextContext);
    router.push(companyDashboardHref(nextContext, role));
  };

  const errorMessage = companies.isError
    ? companies.error instanceof Error
      ? companies.error.message
      : 'Unable to load companies list.'
    : null;

  return (
    <EntityListPageLayout
      breadcrumb="Organisation · Companies"
      title="All Companies"
      subtitle="Overview of all registered companies and their operational footprint"
      onRefresh={() => void companies.refetch()}
      error={errorMessage}
    >
      <EntityListMetricsRow
        metrics={{ total: counts.all, active: counts.active, inactive: counts.inactive }}
        totalLabel="Total Companies"
        activeLabel="Active Companies"
        inactiveLabel="Inactive Companies"
        totalIcon={Building2}
        isLoading={companies.isLoading}
      />

      <EntityListToolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search companies by name, code, or type..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
      />

      <EntityTable
        columns={COLUMNS}
        isLoading={companies.isLoading}
        isEmpty={visibleRows.length === 0}
        emptyIcon={Building2}
        emptyTitle="No companies found"
        emptySubtitle={
          search ? 'Try adjusting your search criteria.' : 'No companies are currently registered.'
        }
      >
        {visibleRows.map((company) => (
          <CompanyRow key={String(company.id)} company={company} onOpen={openCompany} />
        ))}
      </EntityTable>
    </EntityListPageLayout>
  );
}

function CompanyRow({
  company,
  onOpen,
}: Readonly<{ company: CompanyListItem; onOpen: (company: CompanyListItem) => void }>) {
  return (
    <TableRow
      hover
      onClick={() => onOpen(company)}
      sx={{
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
        '&:last-child td, &:last-child th': { border: 0 },
      }}
    >
      <TableCell sx={{ py: 1, px: 1.5 }}>
        <EntityIdentityCell icon={Building2} name={company.name} code={company.code} />
      </TableCell>
      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {company.businessType || 'Hospitality'}
        </Typography>
      </TableCell>
      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: 'nowrap' }}>
        <Chip
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
        <EntityDashboardButton onClick={() => onOpen(company)} />
      </TableCell>
    </TableRow>
  );
}

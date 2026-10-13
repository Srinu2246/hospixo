'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Building2 } from 'lucide-react';

import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { useOrganizationCompanies } from '@/lib/hooks/organization/companies/useOrganizationCompanies';
import type { CompanyListItem } from '@/lib/schemas/organization/companies/companyListSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useSidebarStore } from '@/stores/sidebarStore';

export interface CompaniesPageProps {
  /** Companies loaded on the server for the signed-in organisation. */
  initialCompanies?: CompanyListItem[];
  /** Organisation id from the login session. */
  organizationId?: number;
}

type StatusFilter = 'all' | 'active' | 'inactive';

/**
 * All Companies
 * 1. Page title for the organisation company list
 * 2. Search and status filter
 * 3. Company table. A row opens that company's dashboard.
 */
export function CompaniesPage({
  initialCompanies,
  organizationId,
}: Readonly<CompaniesPageProps> = {}) {
  const router = useRouter();
  const setContext = useSidebarStore((state) => state.setContext);
  const accountOrgId = useSidebarStore((state) => state.account?.org_id ?? undefined);
  const orgId = organizationId ?? accountOrgId;
  const companies = useOrganizationCompanies(orgId, initialCompanies);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
    setContext({
      organizationId: orgId,
      companyId: Number.isFinite(numericId) ? numericId : undefined,
      companyName: company.name,
      companySlug: company.code ?? undefined,
    });
    router.push('/company/dashboard?level=company');
  };

  const columns: readonly DataGridColumn<CompanyListItem>[] = [
    {
      field: 'name',
      headerName: 'Company',
      minWidth: 240,
      renderCell: ({ row }) => (
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
            {row.name}
          </Typography>
          {row.code ? (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
              {row.code}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      field: 'businessType',
      headerName: 'Business Type',
      minWidth: 160,
      renderCell: ({ row }) => row.businessType || 'Hospitality',
    },
    {
      field: 'branchCount',
      headerName: 'Branches',
      minWidth: 120,
      renderCell: ({ row }) => `${row.branchCount} branches`,
    },
    {
      field: 'userCount',
      headerName: 'Users',
      minWidth: 100,
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
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
          Organization · Companies
        </Typography>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mt: 0.5 }}>All Companies</Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          Overview of all registered companies and their operational footprint
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Metric label="Total Companies" value={counts.all} />
        <Metric label="Active Companies" value={counts.active} />
        <Metric label="Inactive Companies" value={counts.inactive} />
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          showClear
          onClear={() => setSearch('')}
          placeholder="Search companies by name, code, or type..."
          ariaLabel="Search companies"
          sx={{ width: { xs: '100%', md: 420 } }}
        />
        <Stack direction="row" spacing={1}>
          <FilterButton
            label={`All ${counts.all}`}
            selected={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <FilterButton
            label={`Active ${counts.active}`}
            selected={statusFilter === 'active'}
            onClick={() => setStatusFilter('active')}
          />
          <FilterButton
            label={`Inactive ${counts.inactive}`}
            selected={statusFilter === 'inactive'}
            onClick={() => setStatusFilter('inactive')}
          />
        </Stack>
      </Stack>

      {companies.isError ? (
        <AlertMessage
          variant="error"
          title="Unable to load companies"
          message={companies.error instanceof Error ? companies.error.message : 'Try again.'}
        />
      ) : null}

      <DataGrid
        columns={columns}
        rows={visibleRows}
        getRowId={(row) => String(row.id)}
        loading={companies.isLoading}
        onRowClick={openCompany}
        emptyIcon={Building2}
        emptyTitle="No companies found"
        emptySubtitle={
          search ? 'Try a different name, code, or type.' : 'No companies are registered yet.'
        }
        ariaLabel="All companies"
        pagination
        paginationEntityName="companies"
      />
    </Stack>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <Box
      sx={{
        flex: 1,
        px: 2,
        py: 1.5,
        borderRadius: '12px',
        border: `1px solid ${colors.border.default}`,
        bgcolor: colors.surface.default,
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}

function FilterButton({
  label,
  selected,
  onClick,
}: Readonly<{ label: string; selected: boolean; onClick: () => void }>) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: '999px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: selected ? colors.white.default : colors.text.secondary,
        bgcolor: selected ? colors.primary.default : colors.surface.muted,
      }}
    >
      {label}
    </ButtonBase>
  );
}

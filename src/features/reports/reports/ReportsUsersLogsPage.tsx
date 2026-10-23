'use client';

/**
 * Reports users-logs tab — shift KPIs, filters, and paginated activity table.
 * Data from GET /v1/branches/{branch_id}/reports/users-logs.
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, Button, Card, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { ChartColumn, Download, FileText, Users, Wallet, type LucideIcon } from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { OrdersTable, type OrdersTableColumn } from '@/components/shared/ui/OrdersTable';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatIsoDate,
} from '@/lib/helpers/reportsOverview';
import { useReportsUsersLogs } from '@/lib/hooks/reports/reports/useBranchReports';
import {
  toReportsUsersLogsViewModel,
  type ReportsUsersLogsBillingOption,
  type ReportsUsersLogsViewModel,
} from '@/lib/schemas/reports/reports/branchReports';
import { reportsUsersLogsCopy, type ReportsUserLogRow } from '@/lib/mocks/reports/reports.mocks';

const KPI_ICONS: Record<string, LucideIcon> = {
  'total-invoices': ChartColumn,
  'net-sales': ChartColumn,
  'staff-worked': Users,
  'total-collected': Wallet,
};

function logText(value: string, weight: number = 400) {
  return (
    <Typography
      sx={{
        fontSize: '0.8125rem',
        fontWeight: weight,
        color: value === '—' ? 'text.secondary' : 'text.primary',
      }}
    >
      {value}
    </Typography>
  );
}

const USER_LOG_COLUMNS: readonly OrdersTableColumn<ReportsUserLogRow>[] = [
  { id: 'opened-by', label: 'Opened by', render: (row) => logText(row.openedBy, 600) },
  { id: 'opened-at', label: 'Opened at', nowrap: true, render: (row) => logText(row.openedAt) },
  {
    id: 'opening-balance',
    label: 'Opening balance (₹)',
    render: (row) => logText(row.openingBalance),
  },
  { id: 'closed-at', label: 'Closed at', nowrap: true, render: (row) => logText(row.closedAt) },
  { id: 'closed-by', label: 'Closed by', render: (row) => logText(row.closedBy) },
  { id: 'total-orders', label: 'Total Orders', render: (row) => logText(row.totalOrders) },
  { id: 'cash', label: 'Cash collected (₹)', render: (row) => logText(row.cashCollected) },
  { id: 'upi', label: 'UPI collected (₹)', render: (row) => logText(row.upiCollected) },
  { id: 'card', label: 'Card collected (₹)', render: (row) => logText(row.cardCollected) },
  { id: 'total', label: 'Total collected (₹)', render: (row) => logText(row.totalCollected, 700) },
  {
    id: 'actions',
    label: 'Actions',
    render: (row) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          aria-label={`Receipt for ${row.openedBy}`}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <FileText size={14} />
        </IconButton>
        <IconButton
          size="small"
          aria-label={`Download ${row.openedBy}`}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          <Download size={14} />
        </IconButton>
      </Box>
    ),
  },
];

type UsersLogsFiltersProps = Readonly<{
  billingUser: string;
  billingUserOptions: readonly ReportsUsersLogsBillingOption[];
  onBillingUserChange: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}>;

function UsersLogsFilters({
  billingUser,
  billingUserOptions,
  onBillingUserChange,
  query,
  onQueryChange,
  onSearch,
}: UsersLogsFiltersProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '180px 1fr auto' },
        gap: 1.5,
        alignItems: 'end',
        mb: 2,
      }}
    >
      <TextField
        select
        label={reportsUsersLogsCopy.billingUserLabel}
        size="small"
        value={billingUser}
        onChange={(event) => onBillingUserChange(event.target.value)}
      >
        {billingUserOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label={reportsUsersLogsCopy.searchLabel}
        size="small"
        placeholder={reportsUsersLogsCopy.searchPlaceholder}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSearch();
          }
        }}
      />
      <Button
        type="button"
        variant="contained"
        onClick={onSearch}
        sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
      >
        {reportsUsersLogsCopy.searchLabel}
      </Button>
    </Box>
  );
}

function UsersLogsReportBody({
  viewModel,
  onPageChange,
  filters,
}: Readonly<{
  viewModel: ReportsUsersLogsViewModel;
  onPageChange: (page: number) => void;
  filters: UsersLogsFiltersProps;
}>) {
  const pageCount = Math.max(1, Math.ceil(viewModel.total / viewModel.pageSize));
  const from = viewModel.total === 0 ? 0 : (viewModel.page - 1) * viewModel.pageSize + 1;
  const to = Math.min(viewModel.page * viewModel.pageSize, viewModel.total);

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {viewModel.summaryStats.map((stat) => (
          <KpiCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={KPI_ICONS[stat.id] ?? ChartColumn}
            accent={stat.accent as KpiCardAccent}
            changePercent={stat.changePercent}
            changeLabel={stat.changeLabel}
            footerText={stat.footerText}
            footerContent={
              stat.closedShifts ? (
                <Typography sx={{ fontSize: '0.8125rem' }}>
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                    {stat.closedShifts}
                  </Box>
                  {stat.openShifts ? (
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      {`  ${stat.openShifts}`}
                    </Box>
                  ) : null}
                </Typography>
              ) : undefined
            }
          />
        ))}
      </Box>

      <Card
        variant="outlined"
        sx={{ borderRadius: '0.75rem', borderColor: 'divider', p: { xs: 2, sm: 2.5 } }}
      >
        <UsersLogsFilters {...filters} />

        {viewModel.rows.length === 0 ? (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 2 }}>
            No shift rows for the selected filters.
          </Typography>
        ) : (
          <OrdersTable rows={viewModel.rows} columns={USER_LOG_COLUMNS} minWidth={1200} />
        )}

        <Box sx={{ mt: 2 }}>
          <TablePagination
            page={viewModel.page}
            pageCount={pageCount}
            onPageChange={onPageChange}
            summary={`Showing ${from} to ${to} of ${viewModel.total} records`}
          />
        </Box>
      </Card>
    </>
  );
}

export function ReportsUsersLogsPage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);

  const [billingUser, setBillingUser] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = reportsUsersLogsCopy.pageSize;

  const comparisonRange = useMemo(
    () => deriveComparisonRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const userId = useMemo(() => {
    if (billingUser === 'all') return undefined;
    const parsed = Number(billingUser);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [billingUser]);

  const { data, isLoading, isError, error } = useReportsUsersLogs({
    fromDate: dateFrom,
    toDate: dateTo,
    compareFrom: formatIsoDate(comparisonRange.compareFrom),
    compareTo: formatIsoDate(comparisonRange.compareTo),
    userId,
    search: appliedSearch,
    page,
    pageSize,
  });

  const viewModel = useMemo(
    () =>
      data
        ? toReportsUsersLogsViewModel(
            data,
            formatIsoDate(comparisonRange.compareFrom),
            formatIsoDate(comparisonRange.compareTo),
          )
        : undefined,
    [data, comparisonRange.compareFrom, comparisonRange.compareTo],
  );

  const billingUserOptions = viewModel?.billingUserOptions ?? [
    { value: 'all', label: 'All Billing User' },
  ];

  useEffect(() => {
    if (billingUser === 'all') return;
    const stillValid = billingUserOptions.some((option) => option.value === billingUser);
    if (!stillValid) {
      setBillingUser('all');
    }
  }, [billingUser, billingUserOptions]);

  const handleHeaderDateFromChange = (next: Date) => {
    setDateFrom(next);
    setPage(1);
  };

  const handleHeaderDateToChange = (next: Date) => {
    setDateTo(next);
    setPage(1);
  };

  const filterProps: UsersLogsFiltersProps = {
    billingUser,
    billingUserOptions,
    onBillingUserChange: (value) => {
      setBillingUser(value);
      setPage(1);
    },
    query,
    onQueryChange: setQuery,
    onSearch: () => {
      setAppliedSearch(query.trim());
      setPage(1);
    },
  };

  let reportBody: ReactNode;
  if (isLoading) {
    reportBody = <Loading message="Loading users logs…" />;
  } else if (isError || !viewModel) {
    reportBody = (
      <AlertMessage
        variant="error"
        title="Unable to load users logs"
        message={
          error instanceof Error ? error.message : 'Try adjusting filters and refresh the page.'
        }
      />
    );
  } else {
    reportBody = (
      <UsersLogsReportBody viewModel={viewModel} onPageChange={setPage} filters={filterProps} />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {reportsUsersLogsCopy.title}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 560 }}
          >
            {reportsUsersLogsCopy.subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <ReportsOverviewDateRange
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={handleHeaderDateFromChange}
            onDateToChange={handleHeaderDateToChange}
          />
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<Download size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '0.5rem',
              color: 'info.main',
            }}
          >
            {reportsUsersLogsCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      {reportBody}
    </Box>
  );
}

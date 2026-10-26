'use client';

/**
 * Reports orders tab — summary KPIs and paginated orders table.
 * Summary: GET /v1/branches/{branch_id}/reports/orders/summary
 * Table: GET /v1/branches/{branch_id}/reports/orders
 */

import { useMemo, useState, type ReactNode } from 'react';
import { Box, Button, Card, MenuItem, TextField, Typography } from '@mui/material';
import {
  ClipboardList,
  Download,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { OrdersTable } from '@/components/shared/ui/OrdersTable';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatIsoDate,
  parseIsoDate,
} from '@/lib/helpers/reportsOverview';
import {
  toReportsOrdersListViewModel,
  toReportsOrdersSummaryViewModel,
} from '@/lib/schemas/reports/reports/branchReports';
import {
  useReportsOrdersList,
  useReportsOrdersSummary,
} from '@/lib/hooks/reports/reports/useBranchReports';
import {
  MOCK_REPORTS_ORDERS_SESSION_OPTIONS,
  MOCK_REPORTS_ORDERS_TYPE_OPTIONS,
  reportsOrdersCopy,
} from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, LucideIcon> = {
  'total-orders': ClipboardList,
  'dine-in-orders': UtensilsCrossed,
  'takeaway-orders': ShoppingBag,
  'delivery-orders': Truck,
};

const ORDER_TYPE_QUERY: Record<string, string> = {
  'Dine-in': 'dine_in',
  Takeaway: 'takeaway',
  Delivery: 'delivery',
};

function OrdersSectionCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        p: { xs: 2, sm: 2.5 },
      }}
    >
      {children}
    </Card>
  );
}

export function ReportsOrdersPage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [filterFrom, setFilterFrom] = useState(formatIsoDate(defaultRange.dateFrom));
  const [filterTo, setFilterTo] = useState(formatIsoDate(defaultRange.dateTo));
  const [queryFrom, setQueryFrom] = useState(defaultRange.dateFrom);
  const [queryTo, setQueryTo] = useState(defaultRange.dateTo);

  const [sessionFilter, setSessionFilter] = useState<string>(
    MOCK_REPORTS_ORDERS_SESSION_OPTIONS[0],
  );
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>(
    MOCK_REPORTS_ORDERS_TYPE_OPTIONS[0],
  );
  const [orderIdQuery, setOrderIdQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);

  const comparisonRange = useMemo(
    () => deriveComparisonRange(queryFrom, queryTo),
    [queryFrom, queryTo],
  );

  const compareFrom = formatIsoDate(comparisonRange.compareFrom);
  const compareTo = formatIsoDate(comparisonRange.compareTo);

  const summaryQuery = useReportsOrdersSummary({
    dateFrom: queryFrom,
    dateTo: queryTo,
    compareFrom,
    compareTo,
  });

  const orderTypeParam =
    orderTypeFilter === 'All Order Type' ? undefined : ORDER_TYPE_QUERY[orderTypeFilter];

  const ordersListQuery = useReportsOrdersList({
    fromDate: queryFrom,
    toDate: queryTo,
    compareFrom,
    compareTo,
    orderType: orderTypeParam,
    search: appliedSearch,
    page,
    pageSize: reportsOrdersCopy.pageSize,
  });

  const summaryViewModel = useMemo(
    () => (summaryQuery.data ? toReportsOrdersSummaryViewModel(summaryQuery.data) : undefined),
    [summaryQuery.data],
  );

  const listViewModel = useMemo(
    () => (ordersListQuery.data ? toReportsOrdersListViewModel(ordersListQuery.data) : undefined),
    [ordersListQuery.data],
  );

  const isLoading = summaryQuery.isLoading || ordersListQuery.isLoading;

  const handleApplyFilters = () => {
    setQueryFrom(parseIsoDate(filterFrom));
    setQueryTo(parseIsoDate(filterTo));
    setAppliedSearch(orderIdQuery.trim());
    setPage(1);
  };

  const handleHeaderDateFromChange = (next: Date) => {
    setDateFrom(next);
    setFilterFrom(formatIsoDate(next));
    setQueryFrom(next);
    setQueryTo(dateTo);
    setPage(1);
  };

  const handleHeaderDateToChange = (next: Date) => {
    setDateTo(next);
    setFilterTo(formatIsoDate(next));
    setQueryFrom(dateFrom);
    setQueryTo(next);
    setPage(1);
  };

  let reportBody: ReactNode;
  if (isLoading) {
    reportBody = <Loading message="Loading orders report…" />;
  } else if (summaryQuery.isError || !summaryViewModel) {
    reportBody = (
      <AlertMessage
        variant="error"
        title="Unable to load orders report"
        message={
          summaryQuery.error instanceof Error
            ? summaryQuery.error.message
            : 'Try adjusting the date range and refresh.'
        }
      />
    );
  } else {
    const listReady = !ordersListQuery.isError && listViewModel;
    const pageCount = listReady
      ? Math.max(1, Math.ceil(listViewModel.total / listViewModel.pageSize))
      : 1;
    const from =
      listReady && listViewModel.total > 0
        ? (listViewModel.page - 1) * listViewModel.pageSize + 1
        : 0;
    const to = listReady
      ? Math.min(listViewModel.page * listViewModel.pageSize, listViewModel.total)
      : 0;

    reportBody = (
      <>
        <OrdersSectionCard>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {summaryViewModel.summaryStats.map((stat) => (
              <KpiCard
                key={stat.id}
                label={stat.label}
                value={stat.value}
                icon={SUMMARY_ICONS[stat.id] ?? ClipboardList}
                accent={stat.accent as KpiCardAccent}
                footerText={stat.footerText}
                helperText={stat.helperText}
              />
            ))}
          </Box>
          <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
            {reportsOrdersCopy.attributionNote}
          </Typography>
        </OrdersSectionCard>

        <OrdersSectionCard>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(140px, 1fr)) auto repeat(2, minmax(140px, 1fr)) auto',
              },
              gap: 1.5,
              alignItems: 'end',
              mb: 2,
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={filterFrom}
              onChange={(event) => setFilterFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={filterTo}
              onChange={(event) => setFilterTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              type="button"
              variant="contained"
              onClick={handleApplyFilters}
              sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
            >
              {reportsOrdersCopy.applyLabel}
            </Button>
            <TextField
              select
              label={reportsOrdersCopy.sessionLabel}
              size="small"
              value={sessionFilter}
              onChange={(event) => {
                setSessionFilter(event.target.value);
                setPage(1);
              }}
            >
              {MOCK_REPORTS_ORDERS_SESSION_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={reportsOrdersCopy.orderTypeLabel}
              size="small"
              value={orderTypeFilter}
              onChange={(event) => {
                setOrderTypeFilter(event.target.value);
                setPage(1);
              }}
            >
              {MOCK_REPORTS_ORDERS_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={reportsOrdersCopy.orderIdLabel}
              size="small"
              placeholder={reportsOrdersCopy.orderIdPlaceholder}
              value={orderIdQuery}
              onChange={(event) => setOrderIdQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleApplyFilters();
                }
              }}
            />
            <Button
              type="button"
              variant="contained"
              onClick={handleApplyFilters}
              sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
            >
              {reportsOrdersCopy.searchLabel}
            </Button>
          </Box>

          {ordersListQuery.isError ? (
            <AlertMessage
              variant="error"
              title="Unable to load order rows"
              message={
                ordersListQuery.error instanceof Error
                  ? ordersListQuery.error.message
                  : 'Try adjusting filters and search again.'
              }
            />
          ) : !listViewModel || listViewModel.rows.length === 0 ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 2 }}>
              No orders for the selected filters.
            </Typography>
          ) : (
            <OrdersTable rows={listViewModel.rows} minWidth={1100} />
          )}

          {listReady ? (
            <Box sx={{ mt: 2 }}>
              <TablePagination
                page={listViewModel.page}
                pageCount={pageCount}
                onPageChange={setPage}
                summary={`Showing ${from} to ${to} of ${listViewModel.total} records`}
              />
            </Box>
          ) : null}
        </OrdersSectionCard>
      </>
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
          <Typography
            variant="h6"
            sx={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {reportsOrdersCopy.title}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 560 }}
          >
            {reportsOrdersCopy.subtitle}
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
              fontSize: '0.8125rem',
              borderRadius: '0.5rem',
              color: 'info.main',
            }}
          >
            {reportsOrdersCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      {reportBody}
    </Box>
  );
}

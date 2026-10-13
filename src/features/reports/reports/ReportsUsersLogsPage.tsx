'use client';

/** Reports users-logs tab — shift KPIs, filters, and paginated activity table. */

import { useMemo, useState } from 'react';
import { Box, Button, Card, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { ChartColumn, Download, FileText, Users, Wallet } from 'lucide-react';
import type { ElementType } from 'react';

import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { OrdersTable, type OrdersTableColumn } from '@/components/shared/ui/OrdersTable';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import {
  MOCK_REPORTS_USER_LOG_ROWS,
  MOCK_REPORTS_USERS_LOGS_BILLING_USERS,
  MOCK_REPORTS_USERS_LOGS_SUMMARY,
  reportsUsersLogsCopy,
  type ReportsUserLogRow,
} from '@/lib/mocks/reports/reports.mocks';

const KPI_ICONS: Record<string, ElementType> = {
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

export function ReportsUsersLogsPage() {
  const [billingUser, setBillingUser] = useState<string>(reportsUsersLogsCopy.billingUserDefault);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = reportsUsersLogsCopy.pageSize;

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return MOCK_REPORTS_USER_LOG_ROWS.filter((row) => {
      const matchesUser = billingUser === 'All Billing User' || row.openedBy === billingUser;
      const matchesQuery = needle.length === 0 || row.openedBy.toLowerCase().includes(needle);
      return matchesUser && matchesQuery;
    });
  }, [billingUser, query]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);
  const from = filteredRows.length === 0 ? 0 : start + 1;
  const to = start + pageRows.length;

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
          <Button
            type="button"
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '0.5rem' }}
          >
            {reportsUsersLogsCopy.dateRangeLabel}
          </Button>
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {MOCK_REPORTS_USERS_LOGS_SUMMARY.map((stat) => (
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '160px auto 180px 1fr auto' },
            gap: 1.5,
            alignItems: 'end',
            mb: 2,
          }}
        >
          <TextField
            label="Date"
            size="small"
            value={reportsUsersLogsCopy.filterDate}
            slotProps={{ input: { readOnly: true } }}
          />
          <Button
            type="button"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
          >
            {reportsUsersLogsCopy.applyLabel}
          </Button>
          <TextField
            select
            label={reportsUsersLogsCopy.billingUserLabel}
            size="small"
            value={billingUser}
            onChange={(event) => {
              setBillingUser(event.target.value);
              setPage(1);
            }}
          >
            {MOCK_REPORTS_USERS_LOGS_BILLING_USERS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={reportsUsersLogsCopy.searchLabel}
            size="small"
            placeholder={reportsUsersLogsCopy.searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Button
            type="button"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
          >
            {reportsUsersLogsCopy.searchLabel}
          </Button>
        </Box>

        <OrdersTable rows={pageRows} columns={USER_LOG_COLUMNS} minWidth={1200} />

        <Box sx={{ mt: 2 }}>
          <TablePagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
            summary={`Showing ${from} to ${to} of ${filteredRows.length} records`}
          />
        </Box>
      </Card>
    </Box>
  );
}

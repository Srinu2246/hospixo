'use client';

/** Reports orders tab — summary KPIs, filters, and orders table. */

import { useState } from 'react';
import { Box, Button, Card, MenuItem, TextField, Typography } from '@mui/material';
import { ClipboardList, Download, ShoppingBag, Truck, UtensilsCrossed } from 'lucide-react';
import type { ElementType } from 'react';

import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { OrdersTable } from '@/components/shared/ui/OrdersTable';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import {
  MOCK_REPORTS_ORDERS_SESSION_OPTIONS,
  MOCK_REPORTS_ORDERS_SUMMARY,
  MOCK_REPORTS_ORDERS_TABLE_ROWS,
  MOCK_REPORTS_ORDERS_TYPE_OPTIONS,
  reportsOrdersCopy,
} from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, ElementType> = {
  'total-orders': ClipboardList,
  'dine-in-orders': UtensilsCrossed,
  'takeaway-orders': ShoppingBag,
  'delivery-orders': Truck,
};

export function ReportsOrdersPage() {
  const [session, setSession] = useState<string>(reportsOrdersCopy.sessionDefault);
  const [orderType, setOrderType] = useState<string>(reportsOrdersCopy.orderTypeDefault);
  const [orderId, setOrderId] = useState('');
  const [page, setPage] = useState(1);

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
          <Button
            type="button"
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '0.5rem',
            }}
          >
            {reportsOrdersCopy.dateRangeLabel}
          </Button>
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {MOCK_REPORTS_ORDERS_SUMMARY.map((stat) => (
            <KpiCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={SUMMARY_ICONS[stat.id] ?? ClipboardList}
              accent={stat.accent as KpiCardAccent}
              footerText={stat.footerText}
            />
          ))}
        </Box>
        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          {reportsOrdersCopy.netSalesNote}
        </Typography>
      </Card>

      <Card
        variant="outlined"
        sx={{
          borderRadius: '0.75rem',
          bgcolor: 'background.paper',
          borderColor: 'divider',
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(6, minmax(0, 1fr)) auto',
            },
            gap: 1.5,
            alignItems: 'end',
          }}
        >
          <TextField
            label="Start Date"
            size="small"
            value={reportsOrdersCopy.filterStartDate}
            slotProps={{ input: { readOnly: true } }}
          />
          <TextField
            label="End Date"
            size="small"
            value={reportsOrdersCopy.filterEndDate}
            slotProps={{ input: { readOnly: true } }}
          />
          <Button
            type="button"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
          >
            {reportsOrdersCopy.applyLabel}
          </Button>
          <TextField
            select
            label={reportsOrdersCopy.sessionLabel}
            size="small"
            value={session}
            onChange={(e) => setSession(e.target.value)}
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
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
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
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <Button
            type="button"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
          >
            {reportsOrdersCopy.searchLabel}
          </Button>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <OrdersTable rows={MOCK_REPORTS_ORDERS_TABLE_ROWS} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TablePagination
            page={page}
            pageCount={2}
            onPageChange={setPage}
            summary={reportsOrdersCopy.tableFooter}
          />
        </Box>
      </Card>
    </Box>
  );
}

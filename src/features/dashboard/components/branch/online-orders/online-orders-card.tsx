'use client';

import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type {
  BranchDashboardOverview,
  BranchDashboardPeriod,
} from '@/features/dashboard/types/branch-dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import { PeriodSelect } from '@/features/dashboard/components/branch/shared/period-select';

import { OnlinePlatformBadge } from './online-platform-badge';

type OnlineOrdersCardProps = Readonly<{
  onlineOrders: BranchDashboardOverview['onlineOrders'];
  period: BranchDashboardPeriod;
  onPeriodChange: (period: BranchDashboardPeriod) => void;
}>;

export function OnlineOrdersCard({ onlineOrders, period, onPeriodChange }: OnlineOrdersCardProps) {
  return (
    <Card
      variant="outlined"
      id="online-orders"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          {branchDashboardCopy.onlineOrdersTitle}
        </Typography>
        <PeriodSelect value={period} onChange={onPeriodChange} ariaLabel="Online orders period" />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
          bgcolor: 'action.hover',
          p: 1.5,
          borderRadius: '0.5rem',
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}
          >
            {branchDashboardCopy.onlineOrdersSummaryLabel}
          </Typography>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary' }}>
            {formatCurrency(onlineOrders.totalSales)}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}
          >
            {branchDashboardCopy.onlineOrdersCountLabel}
          </Typography>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary' }}>
            {onlineOrders.totalOrders}
          </Typography>
        </Box>
      </Box>

      <TableContainer
        sx={{ borderRadius: '0.5rem', border: 1, borderColor: 'divider', mt: 'auto' }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                {branchDashboardCopy.platformColumn}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1 }}>
                {branchDashboardCopy.ordersColumn}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {onlineOrders.platforms.map((platform) => (
              <TableRow key={platform.id} hover>
                <TableCell sx={{ py: 1 }}>
                  <OnlinePlatformBadge id={platform.id} label={platform.platform} />
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.8125rem', fontWeight: 600, py: 1 }}>
                  {platform.orders.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            ))}
            {onlineOrders.platforms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                  No platforms active.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

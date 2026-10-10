'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import type {
  LiveOrderAction,
  LiveOrderRow,
  LiveOrderStatus,
} from '@/features/pos/config/dashboard';
import { getLiveOrderActionLabel, getLiveOrderStatusLabel } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

const statusChipColor: Record<LiveOrderStatus, 'warning' | 'success' | 'secondary' | 'default'> = {
  preparing: 'warning',
  ready: 'success',
  billing: 'secondary',
};

const actionTooltips: Record<LiveOrderAction, string> = {
  view: 'Open all orders to review this ticket',
  pay: 'Go to payment and settlement',
  edit: 'Add items or edit the order on dine-in',
};

interface LiveOrderQueueProps {
  orders: LiveOrderRow[];
  onAction?: (orderId: string, action: LiveOrderAction) => void;
}

export function LiveOrderQueue({ orders, onAction }: Readonly<LiveOrderQueueProps>) {
  return (
    <DashboardPanel title="Live Order Queue" titleId="live-order-queue-title">
      {orders.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
          No active orders in the queue.
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 360 }}>
          <Table size="small" stickyHeader aria-label="Live order queue">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Table</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{order.orderNumber}</TableCell>
                  <TableCell>{order.table}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getLiveOrderStatusLabel(order.status)}
                      color={statusChipColor[order.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Time since order was placed" arrow>
                      <Box component="span">{order.time}</Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={actionTooltips[order.action]} arrow>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onAction?.(order.id, order.action)}
                      >
                        {getLiveOrderActionLabel(order.action)}
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardPanel>
  );
}

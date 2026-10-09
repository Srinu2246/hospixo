'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import type { OpenOrder } from '@/features/pos/config/open-orders';
import {
  formatOpenOrderAmount,
  formatOpenOrderTime,
  getOpenOrderTypeLabel,
  openOrderActions,
  openOrdersPageMeta,
  resolveOpenOrderAmount,
} from '@/features/pos/config/open-orders';
import {
  KitchenStatusPill,
  PaymentStatusPill,
} from '@/features/pos/screens/open-orders/open-order-status-pill';

interface OpenOrdersTableProps {
  orders: OpenOrder[];
  onAddItems: (orderId: string) => void;
  onSettleBill: (orderId: string) => void;
}

const headerCellSx = {
  py: 1.75,
  px: 2,
  borderColor: 'var(--pos-border)',
  color: 'var(--pos-text-muted)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
} as const;

const bodyCellSx = {
  py: 2,
  px: 2,
  borderColor: 'var(--pos-border)',
  fontSize: 14,
  verticalAlign: 'middle',
} as const;

export function OpenOrdersTable({
  orders,
  onAddItems,
  onSettleBill,
}: Readonly<OpenOrdersTableProps>) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        overflowX: 'auto',
        borderColor: 'var(--pos-border)',
        borderRadius: 'var(--pos-radius-md)',
        bgcolor: 'var(--pos-surface)',
        boxShadow: 'var(--pos-shadow-card)',
      }}
    >
      <Table sx={{ minWidth: 920 }}>
        <TableHead>
          <TableRow>
            {[
              'Order #',
              'Type',
              'Reference',
              'Kitchen Status',
              'Payment',
              openOrdersPageMeta.tableTimeLabel,
              'Amount',
              'Actions',
            ].map((label) => (
              <TableCell key={label} sx={headerCellSx}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              sx={{
                '&:last-child td': { borderBottom: 0 },
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <TableCell sx={{ ...bodyCellSx, color: 'var(--pos-text)', fontWeight: 700 }}>
                {order.orderNumber}
              </TableCell>
              <TableCell sx={bodyCellSx}>{getOpenOrderTypeLabel(order.type)}</TableCell>
              <TableCell sx={bodyCellSx}>{order.reference}</TableCell>
              <TableCell sx={bodyCellSx}>
                <KitchenStatusPill status={order.kitchenStatus} />
              </TableCell>
              <TableCell sx={bodyCellSx}>
                <PaymentStatusPill status={order.paymentStatus} />
              </TableCell>
              <TableCell sx={bodyCellSx}>{formatOpenOrderTime(order.age)}</TableCell>
              <TableCell sx={{ ...bodyCellSx, color: 'var(--pos-text)', fontWeight: 700 }}>
                {formatOpenOrderAmount(resolveOpenOrderAmount(order))}
              </TableCell>
              <TableCell sx={bodyCellSx}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Tooltip title="Add items to this order">
                    <Button
                      variant="text"
                      onClick={() => onAddItems(order.id)}
                      sx={{
                        minHeight: 34,
                        px: 1.5,
                        color: 'var(--pos-primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {openOrderActions.addItems}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Open this order to settle the bill">
                    <Button
                      variant="contained"
                      onClick={() => onSettleBill(order.id)}
                      sx={{
                        minHeight: 34,
                        px: 1.5,
                        borderRadius: 0.75,
                        bgcolor: 'var(--pos-primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {openOrderActions.settle}
                    </Button>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

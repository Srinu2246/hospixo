'use client';

import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { OpenOrder } from '@/features/pos/config/open-orders';
import {
  formatOpenOrderAmount,
  formatOpenOrderTime,
  getOpenOrderTypeLabel,
  openOrderActions,
  resolveOpenOrderAmount,
} from '@/features/pos/config/open-orders';
import {
  KitchenStatusPill,
  PaymentStatusPill,
} from '@/features/pos/screens/open-orders/open-order-status-pill';

interface CompactOpenOrderCardProps {
  order: OpenOrder;
  onAddItems: (orderId: string) => void;
  onSettleBill: (orderId: string) => void;
}

export function CompactOpenOrderCard({
  order,
  onAddItems,
  onSettleBill,
}: Readonly<CompactOpenOrderCardProps>) {
  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: 1.75,
        borderColor: 'var(--pos-border)',
        borderRadius: 'var(--pos-radius-md)',
        bgcolor: 'var(--pos-surface)',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', fontSize: 12 }}>
        <Typography variant="caption" color="text.secondary">
          <Typography component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {order.orderNumber}
          </Typography>
          {' · '}
          {getOpenOrderTypeLabel(order.type)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatOpenOrderTime(order.age)}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ mt: 1, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {order.reference}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {formatOpenOrderAmount(resolveOpenOrderAmount(order))}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.25, alignItems: 'center' }}>
        <KitchenStatusPill status={order.kitchenStatus} />
        <PaymentStatusPill status={order.paymentStatus} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          type="button"
          variant="outlined"
          fullWidth
          onClick={() => onAddItems(order.id)}
          sx={{ textTransform: 'none', fontSize: 12, fontWeight: 600 }}
        >
          {openOrderActions.addItems}
        </Button>
        <Button
          type="button"
          variant="contained"
          fullWidth
          onClick={() => onSettleBill(order.id)}
          sx={{
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 600,
            bgcolor: 'var(--pos-primary)',
            '&:hover': { bgcolor: 'var(--pos-primary-hover)' },
          }}
        >
          {openOrderActions.settleBill}
        </Button>
      </Stack>
    </Paper>
  );
}

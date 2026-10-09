'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ReadyOrderItem, ReadyOrderStatus } from '@/features/pos/config/dashboard';
import { getReadyOrderStatusLabel } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

const statusChipColor: Record<ReadyOrderStatus, 'success' | 'info' | 'warning'> = {
  readyToServe: 'success',
  waitingPickup: 'info',
  waitingDriver: 'warning',
};

interface ReadyOrdersPanelProps {
  orders: ReadyOrderItem[];
}

export function ReadyOrdersPanel({ orders }: Readonly<ReadyOrdersPanelProps>) {
  return (
    <DashboardPanel title="Ready Orders" titleId="ready-orders-title">
      {orders.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
          No ready orders right now.
        </Typography>
      ) : (
        <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {orders.map((order) => (
            <Stack
              key={order.id}
              component="li"
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
            >
              <Typography variant="body2" fontWeight={500}>
                {order.label}
              </Typography>
              <Chip
                size="small"
                label={getReadyOrderStatusLabel(order.status)}
                color={statusChipColor[order.status]}
                variant="outlined"
              />
            </Stack>
          ))}
        </Stack>
      )}
    </DashboardPanel>
  );
}

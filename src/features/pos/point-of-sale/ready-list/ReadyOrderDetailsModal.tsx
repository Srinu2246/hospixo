'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Modal } from '@/components/shared/ui/Modal';
import { colors } from '@/lib/theme/mui/colors';
import type { ReadyOrderItem } from '@/lib/mocks/pos/usePosOrders.mocks';

export interface ReadyOrderDetailsModalProps {
  order: ReadyOrderItem | null;
  onClose: () => void;
}

export function ReadyOrderDetailsModal({ order, onClose }: Readonly<ReadyOrderDetailsModalProps>) {
  if (!order) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Order Details · ${order.table}`}
      subtitle={`${order.token} · ${order.readyTimeAgo}`}
      width={520}
      height="auto"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: '12px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Items Ready
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: 'primary.main' }}>
              {order.itemsCount} Items
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Priority</Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 800,
                color: order.priority === 'HIGH' ? 'error.main' : 'text.primary',
              }}
            >
              {order.priority}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              Payment Status
            </Typography>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 800,
                color: order.paymentStatus === 'PAID' ? 'success.main' : 'warning.main',
              }}
            >
              {order.paymentStatus}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography
            sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}
          >
            Prepared Dishes
          </Typography>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.primary' }}>
            &quot;{order.dishSummary}&quot;
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
}

'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import type { OnlineOrder } from '@/features/pos/config/online-orders';
import {
  formatOnlineOrderAmount,
  getOnlineOrderChannelLabel,
  getOnlineOrderPriorityLabel,
} from '@/features/pos/config/online-orders';

interface OnlineOrderCardProps {
  order: OnlineOrder;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  isMutating: boolean;
}

const channelColors = {
  swiggy: { backgroundColor: '#ffedd5', color: '#7c2d12' },
  zomato: { backgroundColor: '#fee2e2', color: '#7f1d1d' },
  website: { backgroundColor: '#dbeafe', color: '#1e3a8a' },
} as const;

const priorityColors = {
  new: { borderColor: '#fecaca', color: 'error.main' },
  normal: { borderColor: 'divider', color: 'text.secondary' },
  high: { borderColor: '#fecaca', color: 'error.main' },
  ready: { borderColor: '#bbf7d0', color: '#022c22' },
} as const;

export function OnlineOrderCard({
  order,
  onAccept,
  onReject,
  onMarkReady,
  isMutating,
}: Readonly<OnlineOrderCardProps>) {
  const actionButtonSx = {
    flex: 1,
    minHeight: 42,
    borderRadius: 1,
    fontWeight: 700,
    textTransform: 'none',
  } as const;

  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
        p: { xs: 1.75, sm: 2 },
        borderColor: 'var(--pos-border)',
        borderRadius: 'var(--pos-radius-md)',
        bgcolor: 'var(--pos-surface)',
        boxShadow: 'var(--pos-shadow-card)',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            label={getOnlineOrderChannelLabel(order.channel)}
            sx={{
              alignSelf: 'flex-start',
              minHeight: 24,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.03em',
              ...channelColors[order.channel],
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
            {order.orderNumber} · {order.timeLabel}
          </Typography>
        </Stack>
        <Tooltip title={`Order priority: ${getOnlineOrderPriorityLabel(order.priority)}`}>
          <Chip
            size="small"
            variant="outlined"
            label={getOnlineOrderPriorityLabel(order.priority)}
            sx={{
              minHeight: 26,
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              ...priorityColors[order.priority],
            }}
          />
        </Tooltip>
      </Stack>

      <Stack spacing={1.25}>
        <Typography variant="body1" sx={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
          {order.itemsSummary}
        </Typography>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          {order.prepaid ? (
            <Tooltip title="Payment has already been collected for this order">
              <Chip
                size="small"
                label="Prepaid"
                sx={{
                  minHeight: 24,
                  borderRadius: 999,
                  bgcolor: '#d1fae5',
                  color: '#022c22',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            </Tooltip>
          ) : null}
          <Typography variant="subtitle1" sx={{ fontSize: 16, fontWeight: 700 }}>
            {formatOnlineOrderAmount(order.amount)}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', gap: 1.25, mt: 'auto' }}>
        {order.actionState === 'pendingAccept' ? (
          <>
            <Tooltip title="Reject this online order">
              <Box component="span" sx={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => onReject?.(order.id)}
                  disabled={isMutating}
                  sx={{ ...actionButtonSx, borderColor: '#fecaca' }}
                >
                  Reject
                </Button>
              </Box>
            </Tooltip>
            <Tooltip title="Accept this order and send it to preparation">
              <Box component="span" sx={{ flex: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => onAccept?.(order.id)}
                  disabled={isMutating}
                  startIcon={<Check size={16} aria-hidden />}
                  sx={{
                    ...actionButtonSx,
                    bgcolor: 'var(--pos-success)',
                    '&:hover': { bgcolor: 'var(--pos-success)', filter: 'brightness(0.92)' },
                  }}
                >
                  Accept
                </Button>
              </Box>
            </Tooltip>
          </>
        ) : null}

        {order.actionState === 'readyForPickup' ? (
          <Tooltip title="Mark this order ready for the delivery partner to collect">
            <Box component="span" sx={{ width: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => onMarkReady?.(order.id)}
                disabled={isMutating}
                sx={{
                  ...actionButtonSx,
                  bgcolor: 'var(--pos-success)',
                  '&:hover': { bgcolor: 'var(--pos-success)', filter: 'brightness(0.92)' },
                }}
              >
                Ready for pickup
              </Button>
            </Box>
          </Tooltip>
        ) : null}

        {order.actionState === 'readyForPickupDone' ? (
          <Tooltip title="This order is ready for pickup">
            <Box component="span" sx={{ width: '100%' }}>
              <Button
                fullWidth
                disabled
                variant="contained"
                sx={{ ...actionButtonSx, bgcolor: '#e4e4e7', color: 'text.secondary' }}
              >
                Ready for pickup
              </Button>
            </Box>
          </Tooltip>
        ) : null}

        {order.actionState === 'pickedUp' ? (
          <Typography
            variant="body2"
            sx={{
              width: '100%',
              p: 1.25,
              borderRadius: 1,
              bgcolor: 'action.hover',
              color: 'text.secondary',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Picked up by partner
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

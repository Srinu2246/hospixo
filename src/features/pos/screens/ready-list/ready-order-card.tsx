'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Utensils } from 'lucide-react';

import type { ReadyOrder } from '@/features/pos/config/ready-list';

interface ReadyOrderCardProps {
  order: ReadyOrder;
  onServe: (orderId: string) => void;
  isMutating: boolean;
  compact?: boolean;
}

export function ReadyOrderCard({
  order,
  onServe,
  isMutating,
  compact = false,
}: Readonly<ReadyOrderCardProps>) {
  const badgeSx = {
    height: 'auto',
    minHeight: 22,
    borderRadius: 1,
    fontSize: compact ? 10 : 8,
    fontWeight: 700,
    lineHeight: 1,
    '& .MuiChip-label': { px: 0.9, py: 0.5 },
  } as const;

  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        p: compact ? 1.75 : 2,
        borderColor: '#edf0f4',
        borderRadius: 1.5,
        bgcolor: 'var(--pos-surface)',
        boxShadow: '0 5px 18px rgb(15 23 42 / 0.06)',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
          {!compact ? <Utensils size={15} color="var(--muted-foreground)" aria-hidden /> : null}
          <Typography
            component="h2"
            variant="subtitle2"
            sx={{
              overflow: 'hidden',
              color: '#171717',
              fontSize: compact ? 15 : 14,
              fontWeight: 700,
              lineHeight: 1.3,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order.table}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, fontSize: compact ? 12 : 10 }}
        >
          {compact ? '' : 'Ready '}
          {order.readyAgo}
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: compact ? 1.5 : 1.75,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: compact ? 12 : 10 }}>
          Token {order.token}
        </Typography>
        <Tooltip title={`Priority: ${order.priority}`}>
          <Chip
            size="small"
            label={order.priority.toUpperCase()}
            sx={{
              ...badgeSx,
              bgcolor: order.priority === 'high' ? '#fee2e2' : 'action.hover',
              color: order.priority === 'high' ? '#991b1b' : '#3f3f46',
            }}
          />
        </Tooltip>
      </Stack>

      {compact ? (
        <Box
          sx={{
            mt: 1.5,
            p: 1.25,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700 }}>
            {order.itemCount} Items
          </Typography>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              mt: 0.5,
              fontSize: 12,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {order.itemSummary}
          </Typography>
        </Box>
      ) : (
        <>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.75 }}
          >
            <Typography variant="caption" sx={{ color: '#1d4ed8', fontSize: 12, fontWeight: 700 }}>
              {order.itemCount} Items
            </Typography>
            <Tooltip title="Order is prepared and ready to serve">
              <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563eb' }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#2563eb', fontSize: 10, fontWeight: 600 }}
                >
                  Ready
                </Typography>
              </Stack>
            </Tooltip>
          </Stack>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ minHeight: 35, mt: 1, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                fontSize: 11,
                fontStyle: 'italic',
                fontWeight: 600,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {order.itemSummary}
            </Typography>
            <Tooltip title={`Payment status: ${order.payment}`}>
              <Chip
                size="small"
                label={order.payment.toUpperCase()}
                sx={{
                  ...badgeSx,
                  bgcolor: order.payment === 'paid' ? '#d1fae5' : '#fef3c7',
                  color: order.payment === 'paid' ? '#065f46' : '#92400e',
                }}
              />
            </Tooltip>
          </Stack>
        </>
      )}

      <Stack direction="row" spacing={1} sx={{ display: compact ? 'none' : 'flex', mt: 1.75 }}>
        <Button
          variant="outlined"
          sx={{
            minHeight: 32,
            flex: 1,
            borderColor: '#d4d4d8',
            color: '#3f3f46',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          View Order
        </Button>
        <Tooltip title="Mark this order as served">
          <Box component="span" sx={{ flex: 1 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => onServe(order.id)}
              disabled={isMutating}
              sx={{
                minHeight: 32,
                border: '1px solid var(--pos-primary)',
                borderRadius: 0.75,
                bgcolor: 'var(--pos-primary)',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: 'var(--pos-primary-hover)' },
              }}
            >
              Serve
            </Button>
          </Box>
        </Tooltip>
      </Stack>
      {compact ? (
        <Tooltip title="Mark this order as served">
          <Box component="span" sx={{ width: '100%', mt: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => onServe(order.id)}
              disabled={isMutating}
              sx={{
                minHeight: 36,
                borderRadius: 0.75,
                bgcolor: 'var(--pos-primary)',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: 'var(--pos-primary-hover)' },
              }}
            >
              Mark Served
            </Button>
          </Box>
        </Tooltip>
      ) : null}
    </Paper>
  );
}

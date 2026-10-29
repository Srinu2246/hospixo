'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import type { KitchenOrderItem } from '@/types/kitchen-display';
import { KitchenOrderCard } from './KitchenOrderCard';

export interface KitchenColumnProps {
  title: string;
  count: number;
  accentColor: string;
  orders: KitchenOrderItem[];
  onStartPreparing?: (orderId: string, itemId?: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string, itemId?: string) => void;
  onServe?: (orderId: string, itemId?: string) => void;
}

export function KitchenColumn({
  title,
  count,
  accentColor,
  orders,
  onStartPreparing,
  onRecall,
  onMarkReady,
  onServe,
}: Readonly<KitchenColumnProps>) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Header: Title & Circle/Pill Count Badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.25,
        }}
      >
        <Typography
          sx={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            minWidth: 22,
            height: 22,
            px: count > 9 ? 0.9 : 0,
            borderRadius: '9999px',
            bgcolor: accentColor,
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {count}
        </Box>
      </Box>

      {/* 2. Top Solid Colored Accent Line */}
      <Box
        sx={{
          width: '100%',
          height: '3px',
          borderRadius: '2px',
          bgcolor: accentColor,
          mb: 2.25,
        }}
      />

      {/* 3. Cards Vertical Stack */}
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        {orders.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB',
              borderRadius: '14px',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              No orders {title.toLowerCase()}
            </Typography>
          </Box>
        ) : (
          orders.map((order) => (
            <KitchenOrderCard
              key={`${order.id}-${order.items.map((item) => item.id).join('-')}`}
              order={order}
              onStartPreparing={onStartPreparing}
              onRecall={onRecall}
              onMarkReady={onMarkReady}
              onServe={onServe}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}

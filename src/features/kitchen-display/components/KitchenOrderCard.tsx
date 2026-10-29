'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';

import type { KitchenOrderItem, DishCategory } from '@/types/kitchen-display';
import {
  kitchenActionForItemStatus,
  type KitchenStatusAction,
} from '@/lib/schemas/kitchen-display/kitchenStatusSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface KitchenOrderCardProps {
  order: KitchenOrderItem;
  onStartPreparing?: (orderId: string, itemId?: string) => void;
  onRecall?: (orderId: string) => void;
  onMarkReady?: (orderId: string, itemId?: string) => void;
  onServe?: (orderId: string, itemId?: string) => void;
}

function getDishEmoji(icon?: string, category?: DishCategory): string {
  if (icon === 'tikka') return '🍲';
  if (icon === 'curry') return '🥘';
  if (icon === 'bread') return '🫓';
  if (icon === 'biryani') return '🍛';
  if (icon === 'rice') return '🍚';
  if (icon === 'chicken') return '🍗';
  if (icon === 'corn') return '🌽';
  if (icon === 'drink') return '🥤';

  switch (category) {
    case 'Starters':
      return '🍢';
    case 'Drinks':
      return '🥤';
    case 'Desserts':
      return '🍨';
    case 'Mains':
    default:
      return '🍛';
  }
}

function renderCategoryPill(category: DishCategory) {
  let bgcolor = '#DBEAFE';
  let color = '#1E40AF';

  if (category === 'Starters') {
    bgcolor = '#FEF3C7';
    color = '#B45309';
  } else if (category === 'Drinks') {
    bgcolor = '#E0F2FE';
    color = '#0369A1';
  } else if (category === 'Desserts') {
    bgcolor = '#FCE7F3';
    color = '#9D174D';
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        bgcolor,
        color,
        fontSize: '0.6875rem',
        fontWeight: 600,
        borderRadius: '4px',
        px: 0.85,
        py: 0.15,
        lineHeight: 1.25,
      }}
    >
      {category}
    </Box>
  );
}

function actionPresentation(actionName: KitchenStatusAction) {
  if (actionName === 'start_preparing') {
    return {
      label: 'Start preparing',
      bgcolor: '#FF4D4F',
      hoverBg: '#EF4444',
      hoverShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
      showCheck: false,
    };
  }
  if (actionName === 'mark_ready') {
    return {
      label: 'Mark ready',
      bgcolor: '#F59E0B',
      hoverBg: '#D97706',
      hoverShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
      showCheck: true,
    };
  }
  return {
    label: 'Served / Picked up',
    bgcolor: '#10B981',
    hoverBg: '#059669',
    hoverShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
    showCheck: false,
  };
}

function orderActionName(status: KitchenOrderItem['status']): KitchenStatusAction | null {
  if (status === 'new') return 'start_preparing';
  if (status === 'preparing') return 'mark_ready';
  if (status === 'ready') return 'complete';
  return null;
}

export function KitchenOrderCard({
  order,
  onStartPreparing,
  onRecall: _onRecall,
  onMarkReady,
  onServe,
}: Readonly<KitchenOrderCardProps>) {
  void _onRecall;
  const isHighPriority = order.priority === 'HIGH';
  const cardActionName = orderActionName(order.status);
  const action = cardActionName ? actionPresentation(cardActionName) : null;
  const runCardAction = (itemId?: string) => {
    if (cardActionName === 'start_preparing') onStartPreparing?.(order.id, itemId);
    else if (cardActionName === 'mark_ready') onMarkReady?.(order.id, itemId);
    else if (cardActionName === 'served' || cardActionName === 'complete')
      onServe?.(order.id, itemId);
  };

  return (
    <Box
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
        borderRadius: '14px',
        border: '1px solid',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB'),
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      {/* 1. Header: Order Number, Table/Takeaway Tag & Priority Badge */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {order.orderNumber}
          </Typography>
          <Box
            sx={{
              display: 'inline-block',
              mt: 0.6,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? colors.surface.darkMuted : '#F3F4F6',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB',
              borderRadius: '6px',
              px: 1,
              py: 0.25,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            {order.isTakeaway ? 'Takeaway' : order.tableNumber || 'Dine-In'}
          </Box>
        </Box>

        {/* Priority Badge (HIGH / NORMAL) */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: isHighPriority ? '#EF4444' : '#D1D5DB',
            color: isHighPriority ? '#EF4444' : 'text.secondary',
            borderRadius: '4px',
            px: 1,
            py: 0.25,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {order.priority}
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ py: 0.25 }}>
        {order.items.map((item) => {
          const lineActionName = kitchenActionForItemStatus(item.itemStatus);
          const lineAction = lineActionName ? actionPresentation(lineActionName) : null;
          return (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  fontSize: '1.05rem',
                  lineHeight: 1.2,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getDishEmoji(item.icon, item.category)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                    }}
                  >
                    x{item.quantity}
                  </Typography>
                </Box>
                <Box sx={{ mt: 0.35 }}>{renderCategoryPill(item.category)}</Box>
              </Box>
              {lineAction && order.items.length > 1 ? (
                <Button
                  onClick={() => runCardAction(item.id)}
                  startIcon={lineAction.showCheck ? <CheckIcon sx={{ fontSize: 16 }} /> : undefined}
                  sx={{
                    flexShrink: 0,
                    bgcolor: lineAction.bgcolor,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    px: 1.5,
                    py: 0.7,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: lineAction.hoverBg,
                      boxShadow: lineAction.hoverShadow,
                    },
                  }}
                >
                  {lineAction.label}
                </Button>
              ) : null}
            </Box>
          );
        })}
      </Stack>

      {/* Card action updates every line at this step. item_id is omitted. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pt: 1.5,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : '#E5E7EB',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.6,
            flexShrink: 0,
            minWidth: 70,
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {order.timeLabel}
          </Typography>
        </Box>

        {action ? (
          <Button
            fullWidth
            onClick={() => runCardAction()}
            startIcon={action.showCheck ? <CheckIcon sx={{ fontSize: 18 }} /> : undefined}
            sx={{
              bgcolor: action.bgcolor,
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              py: 0.9,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: action.hoverBg,
                boxShadow: action.hoverShadow,
              },
            }}
          >
            {action.label}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

'use client';

import { Box, Card, Typography } from '@mui/material';
import { ShoppingBag, Truck, UtensilsCrossed } from 'lucide-react';

import type { BranchOrderTypeRow } from '@/features/dashboard/types/branch-dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';

type OrderTypeSummaryRowProps = Readonly<{
  items: readonly BranchOrderTypeRow[];
}>;

const iconMap = {
  'dine-in': UtensilsCrossed,
  'take-away': ShoppingBag,
  delivery: Truck,
} as const;

export function OrderTypeSummaryRow({ items }: OrderTypeSummaryRowProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {items.map((item) => {
        const Icon = iconMap[item.id as keyof typeof iconMap] ?? UtensilsCrossed;

        return (
          <Card
            key={item.id}
            variant="outlined"
            sx={{
              borderRadius: '0.75rem',
              p: '1.25rem 1.5rem',
              bgcolor: 'background.paper',
              borderColor: 'divider',
              boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                bgcolor: 'action.hover',
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5,
              }}
            >
              <Icon size={20} aria-hidden />
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
              {item.label}
            </Typography>
            <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: 'text.primary' }}>
              {formatCurrency(item.sales)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.orders.toLocaleString('en-IN')} orders
            </Typography>
          </Card>
        );
      })}
    </Box>
  );
}

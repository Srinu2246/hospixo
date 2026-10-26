'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { colors } from '@/lib/theme/mui/colors';
import type { PosOrderItem } from '@/lib/mocks/pos/usePosOrders.mocks';

export interface CaptainOpenOrderCardProps {
  order: PosOrderItem;
  onAddItems?: (order: PosOrderItem) => void;
  onSettle?: (order: PosOrderItem) => void;
}

function formatCaptainAmount(order: PosOrderItem): string {
  if (order.amountFormatted.startsWith('₹')) {
    return `Rs ${order.amountFormatted.slice(1)}`;
  }
  return `Rs ${order.amount.toLocaleString('en-IN')}`;
}

/** Mobile open-order card for captain-flow (Figma). */
export function CaptainOpenOrderCard({
  order,
  onAddItems,
  onSettle,
}: Readonly<CaptainOpenOrderCardProps>) {
  const elapsed = order.elapsedLabel ?? '—';

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        p: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 600 }}>
          {order.orderNumber} · {order.typeLabel}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
          {elapsed}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
          {order.reference}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: colors.primary.default }}>
          {formatCaptainAmount(order)}
        </Typography>
      </Stack>

      <Box sx={{ alignSelf: 'flex-start' }}>
        <StatusChip
          status={order.kitchenStatus}
          label={order.kitchenStatusLabel}
          showDot
          pill
          size="small"
        />
      </Box>

      <Stack direction="row" spacing={1.25} sx={{ pt: 0.25 }}>
        <ActionButton
          variant="outlined"
          fullWidth
          onClick={() => onAddItems?.(order)}
          sx={{
            flex: 1,
            minHeight: 40,
            borderRadius: '8px',
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'none',
          }}
        >
          Add Items
        </ActionButton>
        <ActionButton
          variant="primary"
          fullWidth
          onClick={() => onSettle?.(order)}
          sx={{
            flex: 1,
            minHeight: 40,
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            bgcolor: colors.primary.default,
            boxShadow: 'none',
          }}
        >
          Settle Bill
        </ActionButton>
      </Stack>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { Card } from '@/components/shared/ui/Card';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import type { ReadyOrderItem } from '@/lib/mocks/pos/usePosOrders.mocks';

export interface ReadyOrderCardProps {
  order: ReadyOrderItem;
  onViewOrder?: (order: ReadyOrderItem) => void;
  onServe?: (order: ReadyOrderItem) => void;
  isServing?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Plate & Utensils Icon matching the Ready to Serve design
 */
function DiningPlateIcon() {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.gray.light,
        lineHeight: 1,
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Left fork */}
        <path d="M4 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
        <path d="M6 11v10" />
        {/* Center plate with inner circle */}
        <circle cx="13" cy="12" r="7" />
        <circle cx="13" cy="12" r="4" strokeDasharray="1 2" />
        {/* Right knife */}
        <path d="M21 3v7a3 3 0 0 1-3 3v8" />
      </svg>
    </Box>
  );
}

/**
 * ReadyOrderCard Component
 *
 * Implements the card component for the "Ready to Serve" list screen:
 * - Header: Dining icon, Table number, and ready elapsed time
 * - Token number & Priority StatusChip (HIGH / NORMAL)
 * - Item count (blue) & Ready status indicator
 * - Dish summary in quotes & Payment StatusChip (PAID / PENDING)
 * - Dual action buttons: "View Order" (outlined) & "Serve" (primary filled)
 *
 * Built with:
 * - @/components/shared/ui/Card.tsx
 * - @/components/shared/ui/StatusChip.tsx
 * - @/components/shared/form-fields/ActionButton.tsx
 */
export function ReadyOrderCard({
  order,
  onViewOrder,
  onServe,
  isServing = false,
  sx,
}: Readonly<ReadyOrderCardProps>) {
  return (
    <Card
      variant="outlined"
      borderRadius="16px"
      padding="20px 24px"
      sx={{
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 6px 18px rgba(0, 0, 0, 0.6)'
              : '0 6px 18px -2px rgba(0, 0, 0, 0.06)',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : colors.border.dark,
        },
        ...((sx as object) || {}),
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ----------------------------------------------------------- */}
        {/* Row 1: Dining Icon + Table Number & Ready Time Ago          */}
        {/* ----------------------------------------------------------- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <DiningPlateIcon />
            <Typography
              sx={{
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              {order.table}
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {order.readyTimeAgo}
          </Typography>
        </Box>

        {/* ----------------------------------------------------------- */}
        {/* Row 2: Token Number & Priority Chip                         */}
        {/* ----------------------------------------------------------- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {order.token}
          </Typography>

          <StatusChip
            label={order.priority}
            variantType={order.priority === 'HIGH' ? 'danger' : 'default'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 22,
              borderRadius: '6px',
            }}
          />
        </Box>

        {/* ----------------------------------------------------------- */}
        {/* Row 3: Items Count & Ready Indicator                        */}
        {/* ----------------------------------------------------------- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 800,
              color: 'primary.main',
            }}
          >
            {order.itemsCount} Items
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
              }}
            />
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'primary.main',
              }}
            >
              Ready
            </Typography>
          </Box>
        </Box>

        {/* ----------------------------------------------------------- */}
        {/* Row 4: Dish Summary in Quotes & Payment Status Chip         */}
        {/* ----------------------------------------------------------- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            &quot;{order.dishSummary}&quot;
          </Typography>

          <StatusChip
            label={order.paymentStatus}
            variantType={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 22,
              borderRadius: '6px',
            }}
          />
        </Box>

        {/* ----------------------------------------------------------- */}
        {/* Row 5: Action Buttons (View Order & Serve)                  */}
        {/* ----------------------------------------------------------- */}
        <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
          <ActionButton
            variant="outlined"
            size="medium"
            onClick={() => onViewOrder?.(order)}
            fullWidth
            sx={{
              flex: 1,
              borderRadius: '8px',
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            View Order
          </ActionButton>

          <ActionButton
            variant="primary"
            size="medium"
            onClick={() => onServe?.(order)}
            loading={isServing}
            fullWidth
            sx={{
              flex: 1,
              borderRadius: '8px',
              bgcolor: colors.primary.default,
              color: colors.white.default,
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: colors.primary.hover,
              },
            }}
          >
            Serve
          </ActionButton>
        </Stack>
      </Box>
    </Card>
  );
}

export default ReadyOrderCard;

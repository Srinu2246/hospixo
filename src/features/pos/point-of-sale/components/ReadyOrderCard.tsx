'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { colors } from '@/lib/theme/mui/colors';
import type { ReadyOrderItem } from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';

export interface ReadyOrderCardProps {
  order: ReadyOrderItem;
  onDetails?: (order: ReadyOrderItem) => void;
  onMarkServed?: (order: ReadyOrderItem) => void;
  isServing?: boolean;
  sx?: SxProps<Theme>;
}

/** Ready-to-serve order card (captain / Figma layout). */
export function ReadyOrderCard({
  order,
  onDetails,
  onMarkServed,
  isServing = false,
  sx,
}: Readonly<ReadyOrderCardProps>) {
  return (
    <Box
      sx={[
        {
          bgcolor: 'background.paper',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          p: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '-0.01em',
            color: 'text.primary',
          }}
        >
          {order.table}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
          {order.readyTimeAgo}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
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
            ...(order.priority === 'NORMAL'
              ? {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(colors.primary.default, 0.2)
                      : alpha(colors.primary.default, 0.1),
                  color: 'primary.main',
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(colors.primary.default, 0.35)
                      : alpha(colors.primary.default, 0.2),
                }
              : {}),
          }}
        />
      </Stack>

      <Box
        sx={{
          borderRadius: '12px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(colors.primary.default, 0.12)
              : alpha(colors.primary.default, 0.08),
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(colors.primary.default, 0.25)
              : alpha(colors.primary.default, 0.12),
          px: 1.5,
          py: 1.25,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: 'primary.main', mb: 0.5 }}>
          {order.itemsCount} Items
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.45,
          }}
        >
          {order.dishSummary}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.25}>
        <ActionButton
          variant="outlined"
          fullWidth
          onClick={() => onDetails?.(order)}
          sx={{
            flex: 1,
            minHeight: 44,
            borderRadius: '10px',
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: 'none',
          }}
        >
          Details
        </ActionButton>
        <ActionButton
          variant="primary"
          fullWidth
          loading={isServing}
          onClick={() => onMarkServed?.(order)}
          sx={{
            flex: 1,
            minHeight: 44,
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.875rem',
            bgcolor: colors.primary.default,
            boxShadow: 'none',
          }}
        >
          Mark Served
        </ActionButton>
      </Stack>
    </Box>
  );
}

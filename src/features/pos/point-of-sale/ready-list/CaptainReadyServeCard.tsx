'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckIcon from '@mui/icons-material/Check';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';

import { colors } from '@/lib/theme/mui/colors';
import type {
  ReadyOrderItem,
  ReadyOrderLine,
} from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';

const PREVIEW_LINE_COUNT = 3;

export interface CaptainReadyServeCardProps {
  order: ReadyOrderItem;
  showServeAction?: boolean;
  isServing?: boolean;
  onOpen?: (order: ReadyOrderItem) => void;
  onMarkServed?: (order: ReadyOrderItem) => void;
}

export function readyOrderLines(order: ReadyOrderItem): ReadyOrderLine[] {
  if (order.lines.length > 0) return order.lines;
  return order.dishSummary
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({ name, quantity: 1 }));
}

function readyOrderTotal(order: ReadyOrderItem, lines: readonly ReadyOrderLine[]): number {
  return order.totalCount ?? order.servedCount + Math.max(lines.length, 1);
}

function servedTimeLabel(order: ReadyOrderItem): string {
  const raw = order.readyTimeAgo.trim();
  if (/^served\b/i.test(raw)) return raw;
  return `Served ${raw}`;
}

function CaptainReadyStatusCard({
  order,
  onOpen,
}: Readonly<Pick<CaptainReadyServeCardProps, 'order' | 'onOpen'>>) {
  const isPreparing = order.queue === 'pending';
  const lines = readyOrderLines(order);
  const preview = lines.slice(0, PREVIEW_LINE_COUNT);
  const hiddenCount = lines.length - preview.length;
  const itemLabel = lines.length === 1 ? '1 Item' : `${lines.length} Items`;

  return (
    <Box
      onClick={() => onOpen?.(order)}
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        minWidth: 0,
        cursor: onOpen ? 'pointer' : 'default',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <TableRestaurantOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography
            noWrap
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {order.table}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.3 }}>
            {isPreparing ? order.readyTimeAgo : servedTimeLabel(order)}
          </Typography>
          {!isPreparing && order.servedClock ? (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>
              {order.servedClock}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Typography
        sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500, mt: -0.5 }}
      >
        {order.token}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
          {isPreparing ? 'Items preparing' : 'Items'}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.primary.default }}>
          {itemLabel}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {preview.map((line) => (
          <Box
            key={`${order.id}-${line.name}`}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
          >
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
              {line.name}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', flexShrink: 0 }}>
              × {line.quantity}
            </Typography>
          </Box>
        ))}
      </Box>

      {hiddenCount > 0 ? (
        <Button
          onClick={(event) => {
            event.stopPropagation();
            onOpen?.(order);
          }}
          sx={{
            alignSelf: 'flex-start',
            p: 0,
            minWidth: 0,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: colors.primary.default,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          + {hiddenCount} more item{hiddenCount === 1 ? '' : 's'}
        </Button>
      ) : null}

      <Box
        sx={{
          mt: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.75,
          py: 1.05,
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.875rem',
          bgcolor: (theme) =>
            isPreparing
              ? theme.palette.mode === 'dark'
                ? alpha(colors.warning.default, 0.16)
                : '#FFF6E0'
              : theme.palette.mode === 'dark'
                ? alpha(colors.success.default, 0.16)
                : '#E9F9EF',
          color: isPreparing ? colors.warning.dark : colors.success.dark,
        }}
      >
        {isPreparing ? (
          <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
        ) : (
          <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
        )}
        {isPreparing ? 'Preparing' : 'Served'}
      </Box>
    </Box>
  );
}

export function CaptainReadyServeCard({
  order,
  showServeAction = false,
  isServing = false,
  onOpen,
  onMarkServed,
}: Readonly<CaptainReadyServeCardProps>) {
  if (order.queue === 'pending' || order.queue === 'history') {
    return <CaptainReadyStatusCard order={order} onOpen={onOpen} />;
  }

  const lines = readyOrderLines(order);
  const total = readyOrderTotal(order, lines);
  const served = Math.min(order.servedCount, total);
  const progress = total > 0 ? (served / total) * 100 : 0;
  const preview = lines.slice(0, PREVIEW_LINE_COUNT);
  const hiddenCount = lines.length - preview.length;

  return (
    <Box
      onClick={() => onOpen?.(order)}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        minWidth: 0,
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        '&:hover': { borderColor: colors.border.default },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <TableRestaurantOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography
            noWrap
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {order.table}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', flexShrink: 0 }}>
          {order.readyTimeAgo}
        </Typography>
      </Box>

      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
        {order.token}
      </Typography>

      <Box>
        <Typography
          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: colors.danger.default, mb: 0.75 }}
        >
          {served} / {total} served
        </Typography>
        <Box
          sx={{
            height: 4,
            borderRadius: '999px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : colors.divider.light,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              bgcolor: colors.danger.default,
              borderRadius: '999px',
            }}
          />
        </Box>
      </Box>

      <Box>
        <Typography
          sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.secondary', mb: 0.75 }}
        >
          Items to serve ({lines.length})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {preview.map((line) => (
            <Box
              key={`${order.id}-${line.name}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                {line.name}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', flexShrink: 0 }}>
                + {line.quantity}
              </Typography>
            </Box>
          ))}
        </Box>
        {hiddenCount > 0 ? (
          <Button
            onClick={(event) => {
              event.stopPropagation();
              onOpen?.(order);
            }}
            sx={{
              mt: 0.5,
              p: 0,
              minWidth: 0,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: colors.danger.default,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            + {hiddenCount} more item{hiddenCount === 1 ? '' : 's'}
          </Button>
        ) : null}
      </Box>

      {showServeAction ? (
        <Button
          fullWidth
          disabled={isServing}
          onClick={(event) => {
            event.stopPropagation();
            onMarkServed?.(order);
          }}
          startIcon={<CheckIcon sx={{ fontSize: 18 }} />}
          sx={{
            mt: 0.5,
            bgcolor: colors.danger.default,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.875rem',
            py: 1,
            borderRadius: '10px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: colors.danger.dark, boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: colors.danger.default, color: '#FFFFFF', opacity: 0.7 },
          }}
        >
          Mark as served
        </Button>
      ) : null}
    </Box>
  );
}

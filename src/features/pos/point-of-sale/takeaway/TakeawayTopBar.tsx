'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { ChevronDown, ChevronLeft, Plus, SlidersHorizontal, Utensils } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { colors } from '@/lib/theme/mui/colors';
import type { PosTableItem } from '@/lib/mocks/pos/usePosTables.mocks';

function MetaBadge({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.5,
        borderRadius: '8px',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted),
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'text.secondary',
      }}
    >
      {children}
    </Box>
  );
}

function CounterMeta() {
  return (
    <>
      <ButtonBase
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '0.8125rem',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        Counter 01 <ChevronDown size={14} />
      </ButtonBase>
      <ButtonBase
        sx={{
          px: 1.5,
          py: 0.75,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'text.primary',
          fontWeight: 600,
          fontSize: '0.8125rem',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        Token A <ChevronDown size={14} />
      </ButtonBase>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
        Token No : 12
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Oct 24, 2024</Typography>
    </>
  );
}

function TableMeta({ table }: Readonly<{ table: PosTableItem }>) {
  return (
    <>
      <StatusChip status={table.status} label={table.status.toUpperCase()} size="small" showDot />
      <MetaBadge>{table.floorId?.replace('-', ' ').toUpperCase() ?? 'GROUND FLOOR'}</MetaBadge>
      {table.guests !== undefined && (
        <MetaBadge>
          <GroupOutlinedIcon sx={{ fontSize: 15 }} />
          {table.guests} Guests
        </MetaBadge>
      )}
      {table.waiter && (
        <MetaBadge>
          <PersonOutlineOutlinedIcon sx={{ fontSize: 15 }} />
          {table.waiter}
        </MetaBadge>
      )}
    </>
  );
}

export interface TakeawayTopBarProps {
  table?: PosTableItem | null;
  mode: 'takeaway' | 'dine-in' | 'table';
  effectiveOrderId?: string | null;
  resolvedTableName: string | null;
  primaryOrderLabel: string;
  onBackToTables?: () => void;
  onServeItems: () => void;
  onNewOrder: () => void;
}

export function TakeawayTopBar({
  table,
  mode,
  effectiveOrderId,
  resolvedTableName,
  primaryOrderLabel,
  onBackToTables,
  onServeItems,
  onNewOrder,
}: Readonly<TakeawayTopBarProps>) {
  const title = table
    ? `${table.name} · Dine-In`
    : effectiveOrderId
      ? `Order #${effectiveOrderId.replace(/^#/, '')}`
      : 'Take-Away';

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, sm: 3 },
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        {onBackToTables && (
          <ButtonBase
            onClick={onBackToTables}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: 'text.primary',
              fontWeight: 700,
              fontSize: '0.8125rem',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'primary.main',
              },
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Tables
          </ButtonBase>
        )}

        <Typography
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.375rem' },
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>

        {effectiveOrderId && (
          <Box
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: '6px',
              bgcolor: 'action.hover',
              color: 'primary.main',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            Adding Items to Order
          </Box>
        )}

        {table ? <TableMeta table={table} /> : <CounterMeta />}
      </Stack>

      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <IconButton
          size="small"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '8px',
            color: 'text.primary',
            p: 0.85,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <SlidersHorizontal size={18} />
        </IconButton>

        {(resolvedTableName || table) && (
          <ActionButton
            variant="primary"
            size="medium"
            startIcon={<Utensils size={16} />}
            onClick={onServeItems}
            sx={{
              bgcolor: colors.success.default,
              color: colors.white.default,
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: '8px',
              height: 38,
              px: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: colors.success.dark },
            }}
          >
            {primaryOrderLabel}
          </ActionButton>
        )}

        {!table && !resolvedTableName && mode === 'takeaway' && (
          <ActionButton
            variant="primary"
            size="medium"
            startIcon={<Plus size={16} />}
            onClick={onNewOrder}
            sx={{
              bgcolor: colors.primary.default,
              color: colors.white.default,
              fontWeight: 700,
              fontSize: '0.8125rem',
              borderRadius: '8px',
              height: 38,
              px: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: colors.primary.dark },
            }}
          >
            + New Order
          </ActionButton>
        )}
      </Stack>
    </Box>
  );
}

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import { Plus, Minus, Calendar, ChevronDown, Info, Lock } from 'lucide-react';

import { useThemeStore } from '@/stores/themeStore';
import { colors } from '@/lib/theme/mui/colors';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import {
  MOCK_CASH_TRANSACTIONS,
  type CashTransactionItem,
} from '@/lib/mocks/pos/usePosCashShift.mocks';
import { MetricCardsGrid, ActiveShiftBanner } from './MetricCardAndBanner';

export interface CashAndShiftDashboardPageProps {
  onCloseShift?: () => void;
  onAddCashIn?: () => void;
  onAddCashOut?: () => void;
}

/**
 * CashAndShiftPage Component
 *
 * POS Cash & Shift management screen design:
 * 1. Fixed Header: Page title, subtitle, + Add Cash In and - Add Cash Out buttons.
 * 2. 4 Metric KPI Cards (Current shift, Cash in drawer, Total sales, Transactions).
 * 3. Tinted Active Shift Banner directly below the metric cards.
 * 4. Transaction History Table (DataGrid) taking the remaining viewport height,
 *    with scrollable content and sticky column headers.
 * 5. Fixed Footer: Register sync notice and Close Shift button.
 *
 * Pure visual presentation without mock functional event handling.
 * Powered by `@/stores/themeStore` and `@/lib/theme/mui/colors`.
 */
export function CashAndShiftDashboardPage({
  onCloseShift,
  onAddCashIn,
  onAddCashOut,
}: Readonly<CashAndShiftDashboardPageProps> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const mode = useThemeStore((state) => state.mode);

  const handleCloseShift = () => {
    if (onCloseShift) {
      onCloseShift();
      return;
    }
    const current = pathname ? pathname.replace(/\/+$/, '') : '';
    if (current.includes('cash-shift')) {
      const base = current.endsWith('/cash-shift')
        ? current
        : current.substring(0, current.indexOf('/cash-shift') + '/cash-shift'.length);
      router.push(`${base}/close`);
    } else {
      router.push('/pos/point-of-sale/cash-shift/close');
    }
  };

  // Theme-aware tokens
  const textPrimary = mode === 'dark' ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = mode === 'dark' ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = mode === 'dark' ? colors.surface.dark : colors.surface.default;
  const borderColor = mode === 'dark' ? colors.border.dark : colors.border.default;
  const dividerColor = mode === 'dark' ? colors.divider.dark : colors.divider.default;

  // DataGrid Column Definitions
  const columns: readonly DataGridColumn<CashTransactionItem>[] = [
    {
      field: 'time',
      headerName: 'TIME',
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: textSecondary,
            fontWeight: 500,
          }}
        >
          {row.time}
        </Typography>
      ),
    },
    {
      field: 'type',
      headerName: 'TYPE',
      width: 140,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip
          label={row.type}
          variantType="default"
          size="small"
          showDot={false}
          sx={{
            height: 24,
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '6px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(colors.text.secondary, 0.18)
                : alpha(colors.text.secondary, 0.1),
            color: textPrimary,
          }}
        />
      ),
    },
    {
      field: 'description',
      headerName: 'DESCRIPTION',
      minWidth: 320,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: textPrimary,
            letterSpacing: '-0.01em',
          }}
        >
          {row.description}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: ({ row }) => {
        const isNegative = row.amount.startsWith('-');
        return (
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 800,
              color: isNegative ? colors.danger.default : colors.success.default,
            }}
          >
            {row.amount}
          </Typography>
        );
      },
    },
    {
      field: 'balance',
      headerName: 'BALANCE',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 800,
            color: textPrimary,
          }}
        >
          {row.balance}
        </Typography>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Fixed Page Header                                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.25rem', sm: '1.375rem' },
              color: textPrimary,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Cash & Shift
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: textSecondary,
              fontSize: '0.8125rem',
              fontWeight: 500,
              mt: 0.25,
            }}
          >
            Manage cash registers and shift operations
          </Typography>
        </Box>

        {/* Action Buttons: Add Cash In / Add Cash Out */}
        <Stack direction="row" spacing={1.5}>
          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<Plus size={15} />}
            sx={{
              bgcolor: surfaceBg,
              color: textPrimary,
              borderColor: borderColor,
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '8px',
              height: 34,
              px: 1.75,
              '&:hover': {
                bgcolor: alpha(colors.primary.default, 0.06),
                borderColor: colors.primary.default,
              },
            }}
          >
            Add Cash In
          </ActionButton>

          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<Minus size={15} />}
            sx={{
              bgcolor: surfaceBg,
              color: textPrimary,
              borderColor: borderColor,
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '8px',
              height: 34,
              px: 1.75,
              '&:hover': {
                bgcolor: alpha(colors.danger.default, 0.06),
                borderColor: colors.danger.default,
              },
            }}
          >
            Add Cash Out
          </ActionButton>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Top Metric Cards (4 KPI Cards in a Row)                    */}
      {/* ------------------------------------------------------------- */}
      <MetricCardsGrid />

      {/* ------------------------------------------------------------- */}
      {/* 3. Themed Active Shift Banner (Directly below metric cards)   */}
      {/* ------------------------------------------------------------- */}
      <ActiveShiftBanner />

      {/* ------------------------------------------------------------- */}
      {/* 4. Transaction History Table (Remaining Height, Only Scrolls)  */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        {/* Table Header Bar: Title + Date Filter Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            borderBottom: `1px solid ${dividerColor}`,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: textPrimary,
              letterSpacing: '-0.01em',
            }}
          >
            Transaction History
          </Typography>

          {/* Date Selector Pill */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.65,
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              bgcolor: surfaceBg,
              color: textPrimary,
              fontSize: '0.8125rem',
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            <Calendar size={14} color={colors.text.secondary} />
            <span>Today, Oct 24</span>
            <ChevronDown size={14} color={colors.text.secondary} />
          </Box>
        </Box>

        {/* Scrollable DataGrid Area with Sticky Header */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DataGrid
            columns={columns}
            rows={MOCK_CASH_TRANSACTIONS}
            stickyHeader
            height="100%"
            emptyTitle="No transactions found"
            emptySubtitle="No transactions recorded for this cash shift period."
            sx={{
              border: 'none',
              borderRadius: 0,
              boxShadow: 'none',
              bgcolor: 'transparent',
            }}
            tableSx={{
              '& th': {
                color: textSecondary,
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                bgcolor: mode === 'dark' ? colors.surface.darkMuted : colors.background.default,
                borderBottom: `1px solid ${dividerColor}`,
                py: 1.25,
              },
              '& td': {
                borderBottom: `1px solid ${dividerColor}`,
                py: 1.5,
              },
              '& th:first-of-type, & td:first-of-type': {
                pl: { xs: 2, sm: 2.5 },
              },
              '& th:last-of-type, & td:last-of-type': {
                pr: { xs: 2, sm: 2.5 },
              },
              '& tr:hover td': {
                bgcolor: alpha(colors.primary.default, mode === 'dark' ? 0.05 : 0.02),
              },
            }}
          />
        </Box>

        {/* Card Footer: View All Transactions */}
        <Box
          sx={{
            py: 1.5,
            px: 2,
            borderTop: `1px solid ${dividerColor}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              color: colors.primary.default,
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.15s ease',
              '&:hover': {
                textDecoration: 'underline',
                opacity: 0.85,
              },
            }}
          >
            View All Transactions
          </Typography>
        </Box>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 5. Fixed Page Footer                                          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          flexShrink: 0,
          pt: 0.5,
        }}
      >
        {/* Left: Info notice */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info size={18} color={colors.primary.default} />
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: textSecondary,
              fontWeight: 500,
            }}
          >
            Cash balance is synced across all 3 registers in this outlet.
          </Typography>
        </Box>

        {/* Right: Close Shift Action */}
        <ActionButton
          variant="primary"
          size="medium"
          startIcon={<Lock size={16} />}
          onClick={handleCloseShift}
          sx={{
            borderRadius: '8px',
            bgcolor: colors.primary.default,
            fontWeight: 700,
            fontSize: '0.875rem',
            px: 2.5,
            height: 40,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          Close Shift
        </ActionButton>
      </Box>
    </Box>
  );
}

export default CashAndShiftDashboardPage;

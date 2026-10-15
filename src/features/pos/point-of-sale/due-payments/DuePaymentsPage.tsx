'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ButtonBase from '@mui/material/ButtonBase';
import { ChevronRight } from 'lucide-react';
import { alpha } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { MOCK_DUE_PAYMENTS, type DuePaymentItem } from '@/lib/mocks/pos/usePosDuePayments.mocks';

/**
 * DuePaymentsPage Component
 *
 * Full-fidelity Due Payment Listing page layout matching design:
 * 1. Page-level header with blue vertical pill accent and "Settle From POS" toggle switch.
 * 2. Shared AlertMessage banner warning about POS/dashboard settlement synchronization.
 * 3. Flat shared DataGrid table rendering customer details, due date, amount, status chips, and Settle buttons.
 * 4. Page footer with pending counts summary and "View All Billing History" action.
 * Exclusively uses theme tokens from `@/lib/theme/mui/colors` without nested card wrappers.
 */
export function DuePaymentsPage() {
  const [settleFromPos, setSettleFromPos] = useState(true);

  // Rows matching reference design
  const rows = MOCK_DUE_PAYMENTS.slice(0, 3);

  // DataGrid Column Definitions
  const columns: readonly DataGridColumn<DuePaymentItem>[] = [
    {
      field: 'customerName',
      headerName: '',
      minWidth: 240,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ py: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'text.primary',
              lineHeight: 1.3,
            }}
          >
            {row.customerName}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              fontWeight: 500,
              mt: 0.25,
            }}
          >
            ID: {row.customerId}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'DUE DATE',
      minWidth: 160,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontSize: '0.875rem',
            color: 'text.primary',
            fontWeight: 500,
          }}
        >
          {row.dueDate}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'AMOUNT',
      minWidth: 160,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontSize: '0.9375rem',
            color: 'text.primary',
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
          {row.amount}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: '',
      minWidth: 130,
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StatusChip
            variantType={row.statusVariant}
            label={row.statusLabel}
            size="small"
            showDot={false}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 110,
      align: 'right',
      renderCell: () => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButton
            size="small"
            variant="outlined"
            sx={{
              height: 32,
              px: 2,
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: colors.primary.default,
              borderColor: 'transparent',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(colors.primary.default, 0.15)
                  : alpha(colors.primary.default, 0.08),
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'transparent',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? alpha(colors.primary.default, 0.25)
                    : alpha(colors.primary.default, 0.16),
              },
            }}
          >
            Settle
          </ActionButton>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* Top Header Row: Title with Blue Vertical Accent + Settle From POS Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Left Title with Vertical Pill Accent */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 4,
              height: 22,
              borderRadius: '4px',
              bgcolor: colors.primary.default,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            Due Payment Listing
          </Typography>
        </Box>

        {/* Right: Settle From POS Switch */}
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.primary',
              userSelect: 'none',
            }}
          >
            Settle From POS
          </Typography>
          <Switch
            checked={settleFromPos}
            onChange={(e) => setSettleFromPos(e.target.checked)}
            sx={{
              width: 44,
              height: 24,
              padding: 0,
              '& .MuiSwitch-switchBase': {
                padding: 0,
                margin: '2px',
                transitionDuration: '200ms',
                '&.Mui-checked': {
                  transform: 'translateX(20px)',
                  color: colors.white.default,
                  '& + .MuiSwitch-track': {
                    backgroundColor: colors.primary.default,
                    opacity: 1,
                    border: 0,
                  },
                },
              },
              '& .MuiSwitch-thumb': {
                boxSizing: 'border-box',
                width: 20,
                height: 20,
              },
              '& .MuiSwitch-track': {
                borderRadius: 24 / 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : colors.gray.light,
                opacity: 1,
                transition: 'background-color 200ms ease-in-out',
              },
            }}
          />
        </Stack>
      </Box>

      {/* Alert Disclaimer Banner */}
      <AlertMessage
        variant="error"
        message="You can settle the due payments either on the PoS or on the web dashboard simultaneously. To settle the due payments from here, disable it from PoS."
      />

      {/* DataGrid Table directly on Page Canvas */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <DataGrid<DuePaymentItem>
          columns={columns}
          rows={rows}
          pagination={false}
          rowHeight={68}
          sx={{
            border: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            bgcolor: 'transparent',
          }}
          tableSx={{
            '& th': {
              bgcolor: 'transparent',
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& td': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& tr:last-of-type td': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& th:first-of-type, & td:first-of-type': {
              pl: 0,
            },
            '& th:last-of-type, & td:last-of-type': {
              pr: 0,
            },
          }}
        />
      </Box>

      {/* Footer Summary & Billing History Action */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          pt: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          Showing {rows.length} pending due payments
        </Typography>

        <ButtonBase
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: colors.primary.default,
            fontWeight: 700,
            fontSize: '0.875rem',
            borderRadius: '6px',
            p: 0.5,
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              textDecoration: 'underline',
              bgcolor: 'transparent',
            },
          }}
        >
          View All Billing History
          <ChevronRight size={16} />
        </ButtonBase>
      </Box>
    </Box>
  );
}

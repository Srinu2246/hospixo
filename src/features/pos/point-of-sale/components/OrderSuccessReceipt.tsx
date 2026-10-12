'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { Check, Printer, Plus } from 'lucide-react';

import { colors } from '@/lib/theme/mui/colors';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  orderNumber?: string;
  table?: string;
  itemCount?: number;
  brandName?: string;
  dateTime?: string;
  items?: ReceiptItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  platformFee?: number;
  grandTotal?: number;
  paymentMethod?: string;
}

export interface OrderSuccessReceiptProps {
  receipt?: ReceiptData;
  onPrintReceipt?: () => void;
  onNewOrder?: () => void;
  sx?: SxProps<Theme>;
}

import { MOCK_RECEIPT_0132 } from '@/lib/mocks/pos/usePosOrders.mocks';

const DEFAULT_RECEIPT: ReceiptData = MOCK_RECEIPT_0132;

/**
 * OrderSuccessReceipt Component
 *
 * Implements the "Payment Successful!" confirm order screen (Image 2):
 * - Circular green checkmark badge & "Payment Successful!" title
 * - Order & Table subtitle
 * - Center receipt slip with brand, date, dashed lines, items breakdown, and grand total in green
 * - "Print Receipt" and "New Order" bottom action buttons
 */
export function OrderSuccessReceipt({
  receipt = DEFAULT_RECEIPT,
  onPrintReceipt,
  onNewOrder,
  sx,
}: Readonly<OrderSuccessReceiptProps>) {
  const mergedReceipt = { ...DEFAULT_RECEIPT, ...receipt };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
    if (onPrintReceipt) {
      onPrintReceipt();
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.background.obsidian : colors.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        px: 2,
        ...((sx as object) || {}),
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Success Icon Badge                                         */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(colors.success.default, 0.2)
              : alpha(colors.success.default, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: (theme) =>
            theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? `0 2px 12px 0 ${alpha(colors.success.light, 0.25)}`
              : `0 2px 8px 0 ${alpha(colors.success.default, 0.15)}`,
        }}
      >
        <Check size={30} strokeWidth={3} />
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* 2. Success Title & Order Subtitle                             */}
      {/* ------------------------------------------------------------- */}
      <Typography
        sx={{
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          fontWeight: 800,
          color: 'text.primary',
          letterSpacing: '-0.02em',
          mt: 2,
          textAlign: 'center',
        }}
      >
        Payment Successful!
      </Typography>

      <Typography
        sx={{
          fontSize: '0.875rem',
          color: 'text.secondary',
          fontWeight: 500,
          mt: 0.5,
          textAlign: 'center',
        }}
      >
        Order {mergedReceipt.orderNumber} · {mergedReceipt.table} · {mergedReceipt.itemCount} Items
      </Typography>

      {/* ------------------------------------------------------------- */}
      {/* 3. White Receipt Card                                         */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: 'background.paper',
          borderRadius: '16px',
          p: { xs: 2.75, sm: 3.5 },
          mt: 3,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Brand Name & Date */}
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'text.primary',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          {mergedReceipt.brandName}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'text.secondary',
            textAlign: 'center',
            mt: 0.5,
          }}
        >
          {mergedReceipt.dateTime}
        </Typography>

        {/* Dashed Divider */}
        <Box
          sx={{
            borderBottom: '1px dashed',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? colors.divider.dark : colors.divider.default,
            my: 2,
          }}
        />

        {/* Items List */}
        <Stack spacing={1.25}>
          {mergedReceipt.items?.map((item) => (
            <Box
              key={item.name}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  x{item.quantity}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
                Rs {item.price.toLocaleString('en-IN')}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Dashed Divider */}
        <Box
          sx={{
            borderBottom: '1px dashed',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? colors.divider.dark : colors.divider.default,
            my: 2,
          }}
        />

        {/* Financial Breakdown */}
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
              Sub Total
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 600 }}>
              Rs {mergedReceipt.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
              Tax ({Math.round((mergedReceipt.taxRate ?? 0.05) * 100)}%)
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 600 }}>
              Rs {mergedReceipt.taxAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
              Platform Fee
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 600 }}>
              Rs {mergedReceipt.platformFee?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          {/* Grand Total in Emerald Green */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 0.5,
            }}
          >
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: 'text.primary' }}>
              GRAND TOTAL
            </Typography>
            <Typography
              sx={{
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: (theme) =>
                  theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
              }}
            >
              Rs {mergedReceipt.grandTotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Stack>

        {/* Dashed Divider */}
        <Box
          sx={{
            borderBottom: '1px dashed',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? colors.divider.dark : colors.divider.default,
            my: 2,
          }}
        />

        {/* Payment Method */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
            Payment Method
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
            {mergedReceipt.paymentMethod}
          </Typography>
        </Box>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 4. Action Buttons (Print Receipt + New Order)                 */}
      {/* ------------------------------------------------------------- */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: 3.5,
          width: '100%',
          maxWidth: 420,
          justifyContent: 'center',
        }}
      >
        {/* Outlined Print Receipt */}
        <ButtonBase
          onClick={handlePrint}
          sx={{
            flex: 1,
            border: '1.5px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? colors.primary.light : colors.primary.default,
            color: (theme) =>
              theme.palette.mode === 'dark' ? colors.sidebar.badgeText : colors.primary.default,
            bgcolor: 'transparent',
            py: 1.25,
            px: 2.5,
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(colors.primary.default, 0.15)
                  : alpha(colors.primary.default, 0.08),
            },
          }}
        >
          <Printer size={18} strokeWidth={2.2} />
          Print Receipt
        </ButtonBase>

        {/* Filled New Order */}
        <ButtonBase
          onClick={onNewOrder}
          sx={{
            flex: 1,
            bgcolor: colors.primary.default,
            color: colors.white.default,
            py: 1.25,
            px: 2.5,
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: colors.primary.hover,
            },
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          New Order
        </ButtonBase>
      </Stack>
    </Box>
  );
}

export default OrderSuccessReceipt;

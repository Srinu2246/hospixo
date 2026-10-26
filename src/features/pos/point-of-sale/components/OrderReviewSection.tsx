'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';

export interface OrderReviewItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  imageUrl?: string;
}

export interface OrderReviewDiscount {
  id: string;
  label: string;
  tag?: string;
  amount: number;
}

export interface OrderReviewData {
  orderNumber: string;
  table: string;
  items: OrderReviewItem[];
  subtotal: number;
  discounts: OrderReviewDiscount[];
  platformFee: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface OrderReviewSectionProps {
  order: OrderReviewData;
  onApplyCoupon?: (code: string) => void;
  appliedCouponMessage?: string | null;
  /** Captain mobile: primary action below totals (e.g. proceed to payment). */
  onProceed?: () => void;
  proceedLabel?: string;
  /** Captain mobile Figma card (ORDERED ITEMS, no thumbnails). */
  variant?: 'default' | 'captain';
  sx?: SxProps<Theme>;
}

/**
 * OrderReviewSection Component
 *
 * Implements the left card from the "Proceed to Checkout" design:
 * - ORDER REVIEW header with Table 01 and Order number
 * - Item list table with food thumbnails, dish names, quantities, and green unit prices
 * - Order summary section with interactive discount coupon input
 * - Detailed financial breakdown (discounts in red, fees, tax, service charges)
 * - Highlighted blue TOTAL banner
 */
export function OrderReviewSection({
  order,
  onApplyCoupon,
  appliedCouponMessage,
  onProceed,
  proceedLabel = 'Generate Receipt',
  variant = 'default',
  sx,
}: Readonly<OrderReviewSectionProps>) {
  const [couponCode, setCouponCode] = useState('');

  const handleApply = () => {
    if (couponCode.trim() && onApplyCoupon) {
      onApplyCoupon(couponCode.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const formatRsCompact = (value: number) =>
    value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (variant === 'captain') {
    const couponTotal = order.discounts.reduce((sum, d) => sum + d.amount, 0);

    return (
      <Box
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          ...((sx as object) || {}),
        }}
      >
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: 'text.secondary',
            mb: 1.5,
          }}
        >
          ORDERED ITEMS
        </Typography>

        <Stack spacing={1.75} divider={<Divider flexItem />}>
          {order.items.map((item) => (
            <Box
              key={item.id}
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.25 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{item.name}</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.25 }}>
                  {item.quantity} × Rs {formatRsCompact(item.unitPrice)}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0 }}>
                Rs {formatRsCompact(item.unitPrice * item.quantity)}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            px: 1.5,
            py: 0.75,
            '&:focus-within': { borderColor: 'primary.main' },
          }}
        >
          <InputBase
            placeholder="Apply coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
          <ButtonBase
            onClick={handleApply}
            sx={{
              color: colors.primary.default,
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 1,
            }}
          >
            Apply
          </ButtonBase>
        </Box>

        <Stack spacing={1} sx={{ mt: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Subtotal</Typography>
            <Typography sx={{ fontWeight: 600 }}>Rs {formatRsCompact(order.subtotal)}</Typography>
          </Box>
          {couponTotal > 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>Coupon</Typography>
              <Typography sx={{ fontWeight: 600, color: colors.danger.default }}>
                -Rs {formatRsCompact(couponTotal)}
              </Typography>
            </Box>
          ) : null}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Tax ({Math.round(order.taxRate * 100)}% GST)
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>Rs {formatRsCompact(order.taxAmount)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Grand Total</Typography>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1.0625rem', color: colors.primary.default }}
            >
              Rs {formatRsCompact(order.total)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        p: { xs: 2.5, sm: 3.5 },
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        ...((sx as object) || {}),
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Header Row (ORDER REVIEW | Table 01  Order: #0039)          */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          ORDER REVIEW
        </Typography>

        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            {order.table}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            Order: {order.orderNumber}
          </Typography>
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Items Table Columns Header                                 */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 1,
        }}
      >
        <Typography
          sx={{
            flex: 1,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Item Name
        </Typography>
        <Typography
          sx={{
            width: 70,
            textAlign: 'center',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Qty
        </Typography>
        <Typography
          sx={{
            width: 100,
            textAlign: 'right',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Unit Price
        </Typography>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 3. Items Rows                                                 */}
      {/* ------------------------------------------------------------- */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {order.items.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: 0.75,
            }}
          >
            {/* Dish Thumbnail */}
            <Box
              component="img"
              src={
                item.imageUrl ||
                'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80'
              }
              alt={item.name}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                objectFit: 'cover',
                flexShrink: 0,
                mr: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />

            {/* Dish Name */}
            <Typography
              sx={{
                flex: 1,
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'text.primary',
                pr: 2,
              }}
            >
              {item.name}
            </Typography>

            {/* Quantity */}
            <Typography
              sx={{
                width: 70,
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
              }}
            >
              {item.quantity}
            </Typography>

            {/* Unit Price (Green) */}
            <Typography
              sx={{
                width: 100,
                textAlign: 'right',
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: (theme) =>
                  theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
              }}
            >
              Rs {item.unitPrice.toLocaleString('en-IN')}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 1, borderColor: 'divider' }} />

      {/* ------------------------------------------------------------- */}
      {/* 4. Order Summary Section Header                               */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography
          sx={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.3,
          }}
        >
          Order summary
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'text.secondary',
            mt: 0.35,
          }}
        >
          Review your items and apply a discount before checkout.
        </Typography>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 5. Discount Code Input + APPLY Button                         */}
      {/* ------------------------------------------------------------- */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'text.secondary',
            mb: 0.75,
          }}
        >
          Discount Code
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            p: '4px 6px 4px 14px',
            transition: 'border-color 0.15s ease',
            '&:focus-within': {
              borderColor: 'primary.main',
            },
          }}
        >
          <InputBase
            placeholder="Enter coupon code..."
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              fontSize: '0.875rem',
              color: 'text.primary',
              '& input::placeholder': {
                color: 'text.disabled',
                opacity: 1,
              },
            }}
          />

          <ButtonBase
            onClick={handleApply}
            sx={{
              bgcolor: colors.primary.default,
              color: colors.white.default,
              fontSize: '0.8125rem',
              fontWeight: 700,
              px: 2.5,
              py: 0.85,
              borderRadius: '8px',
              letterSpacing: '0.02em',
              transition: 'background-color 0.15s ease-in-out',
              '&:hover': {
                bgcolor: colors.primary.dark,
              },
            }}
          >
            APPLY
          </ButtonBase>
        </Box>

        {appliedCouponMessage && (
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: (theme) =>
                theme.palette.mode === 'dark' ? colors.success.light : colors.success.dark,
              fontWeight: 600,
              mt: 0.75,
              pl: 0.5,
            }}
          >
            ✓ {appliedCouponMessage}
          </Typography>
        )}
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 6. Financial Breakdown List                                   */}
      {/* ------------------------------------------------------------- */}
      <Stack spacing={1.25} sx={{ mb: 2 }}>
        {/* Sub Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
            Sub Total
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 700 }}>
            Rs {order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        {/* Discounts in Red */}
        {order.discounts.map((discount) => (
          <Box
            key={discount.id}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
                {discount.label}
              </Typography>
              {discount.tag && (
                <Chip
                  label={discount.tag}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                    color: 'text.secondary',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Stack>
            <Typography
              sx={{ fontSize: '0.875rem', color: colors.danger.default, fontWeight: 600 }}
            >
              - Rs {discount.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        ))}

        {/* Platform Fee */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
            Platform Fee
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 600 }}>
            Rs {order.platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        {/* Service Charge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
            Service Charge ({Math.round(order.serviceChargeRate * 100)}%)
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 600 }}>
            Rs {order.serviceChargeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        {/* Tax */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
            Tax ({Math.round(order.taxRate * 100)}%)
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 600 }}>
            Rs {order.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Stack>

      {/* ------------------------------------------------------------- */}
      {/* 7. Highlight Total Banner (Soft Blue Box)                     */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? alpha(colors.primary.default, 0.12)
              : alpha(colors.primary.default, 0.06),
          borderRadius: '12px',
          px: 2.5,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 800,
            color: colors.primary.default,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          TOTAL
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.45rem' },
            fontWeight: 800,
            color: colors.primary.default,
            letterSpacing: '-0.02em',
          }}
        >
          Rs {order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>

      {onProceed ? (
        <ButtonBase
          onClick={onProceed}
          sx={{
            mt: 2,
            width: '100%',
            py: 1.5,
            borderRadius: '10px',
            bgcolor: colors.primary.default,
            color: colors.white.default,
            fontWeight: 700,
            fontSize: '0.9375rem',
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: colors.primary.dark },
          }}
        >
          {proceedLabel}
        </ButtonBase>
      ) : null}
    </Box>
  );
}

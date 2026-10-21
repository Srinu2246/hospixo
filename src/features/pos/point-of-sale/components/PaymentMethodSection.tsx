'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { CreditCard, QrCode, Lock } from 'lucide-react';

import { colors } from '@/lib/theme/mui/colors';

export type PaymentMethodId = 'cash' | 'card' | 'upi' | 'part_payment' | 'sodexo';

export interface PaymentOption {
  id: PaymentMethodId;
  label: string;
}

const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'part_payment', label: 'Split Payment' },
  { id: 'sodexo', label: 'Sodexo' },
];

export interface PaymentMethodSectionProps {
  total: number;
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
  onConfirmPayment: () => void;
  isProcessing?: boolean;
  /** Captain mobile checkout (Figma): summary strip + full-width methods. */
  compact?: boolean;
  subtotal?: number;
  taxAmount?: number;
  couponAmount?: number;
  /** When true, parent renders confirm CTA in `#app-shell-footer`. */
  hideConfirmButton?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * PaymentMethodSection Component
 *
 * Implements the right card from the "Proceed to Checkout" design:
 * - PAYMENT METHOD options (Cash, Card, UPI, Part Payment, Sodexo)
 * - Active state with royal blue fill, custom icons, and checked radio
 * - Total row and vibrant coral "Confirm Payment" button
 * - Secured 256-bit encryption banner
 */
export function PaymentMethodSection({
  total,
  selectedMethod,
  onSelectMethod,
  onConfirmPayment,
  isProcessing = false,
  compact = false,
  subtotal,
  taxAmount,
  couponAmount = 0,
  hideConfirmButton = false,
  sx,
}: Readonly<PaymentMethodSectionProps>) {
  const renderMethodIcon = (id: PaymentMethodId, isSelected: boolean) => {
    switch (id) {
      case 'cash':
        return (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              bgcolor: isSelected ? colors.white.default : colors.surface.muted,
              color: isSelected ? colors.primary.dark : colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            ₹
          </Box>
        );
      case 'card':
      case 'part_payment':
        return (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              bgcolor: isSelected ? colors.white.default : colors.surface.muted,
              color: isSelected ? colors.primary.dark : colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={18} strokeWidth={2.2} />
          </Box>
        );
      case 'upi':
      case 'sodexo':
      default:
        return (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '7px',
              bgcolor: isSelected ? colors.white.default : colors.surface.muted,
              color: isSelected ? colors.primary.dark : colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={18} strokeWidth={2.2} />
          </Box>
        );
    }
  };

  const formatRs = (value: number) =>
    value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: compact ? 'transparent' : 'background.paper',
        borderRadius: compact ? 0 : '16px',
        p: compact ? 0 : { xs: 2.5, sm: 3 },
        border: compact ? 'none' : '1px solid',
        borderColor: 'divider',
        boxShadow: compact
          ? 'none'
          : (theme) =>
              theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        ...((sx as object) || {}),
      }}
    >
      {compact && subtotal != null && taxAmount != null ? (
        <Box
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
            mb: 2,
          }}
        >
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Sub Total
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Rs {formatRs(subtotal)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Tax (5%)
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Rs {formatRs(taxAmount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                Coupon Discount
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: couponAmount > 0 ? colors.danger.default : 'text.primary',
                }}
              >
                - Rs {formatRs(couponAmount)}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 1,
                mt: 0.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '0.02em' }}>
                TOTAL AMOUNT
              </Typography>
              <Typography
                sx={{ fontSize: '1.0625rem', fontWeight: 800, color: colors.primary.default }}
              >
                Rs {formatRs(total)}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ) : null}

      {/* ------------------------------------------------------------- */}
      {/* 1. Card Header                                                */}
      {/* ------------------------------------------------------------- */}
      <Typography
        sx={{
          fontSize: compact ? '0.6875rem' : '0.8125rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textAlign: compact ? 'left' : 'center',
          color: compact ? 'text.secondary' : 'text.primary',
          mb: 2,
        }}
      >
        {compact ? 'CHOOSE PAYMENT METHOD' : 'PAYMENT METHOD'}
      </Typography>

      {/* ------------------------------------------------------------- */}
      {/* 2. Selectable Payment Options List                            */}
      {/* ------------------------------------------------------------- */}
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;

          const compactSelected = compact && isSelected;

          return (
            <ButtonBase
              key={option.id}
              onClick={() => onSelectMethod(option.id)}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '12px 16px',
                borderRadius: '12px',
                bgcolor: compact
                  ? 'background.paper'
                  : isSelected
                    ? colors.primary.dark
                    : (theme) =>
                        theme.palette.mode === 'dark' ? 'action.hover' : 'background.paper',
                color: compact || !isSelected ? 'text.primary' : colors.white.default,
                border: compactSelected
                  ? `2px solid ${colors.primary.default}`
                  : isSelected && !compact
                    ? 'none'
                    : '1px solid',
                borderColor: compactSelected
                  ? colors.primary.default
                  : compact
                    ? 'divider'
                    : isSelected
                      ? 'transparent'
                      : 'divider',
                boxShadow: compact ? '0 1px 2px rgba(15, 23, 42, 0.04)' : 'none',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: compact
                    ? 'action.hover'
                    : isSelected
                      ? colors.primary.hover
                      : 'action.hover',
                },
              }}
            >
              {/* Left Icon + Label */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                {renderMethodIcon(option.id, compact ? false : isSelected)}
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    fontWeight: isSelected ? 700 : 600,
                    color: compact || !isSelected ? 'text.primary' : colors.white.default,
                  }}
                >
                  {option.label}
                </Typography>
              </Box>

              {/* Right Custom Radio */}
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: isSelected
                    ? compact
                      ? `2px solid ${colors.primary.default}`
                      : `2px solid ${colors.white.default}`
                    : (theme) =>
                        `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : colors.gray.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'transparent',
                }}
              >
                {isSelected && (
                  <Box
                    sx={{
                      width: compact ? 10 : 10,
                      height: compact ? 10 : 10,
                      borderRadius: '50%',
                      bgcolor: compact ? colors.primary.default : colors.white.default,
                    }}
                  />
                )}
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>

      {!compact ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 1,
            pb: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', fontWeight: 500 }}>
            Total
          </Typography>
          <Typography sx={{ fontSize: '1.125rem', color: 'text.primary', fontWeight: 800 }}>
            Rs {formatRs(total)}
          </Typography>
        </Box>
      ) : null}

      {!hideConfirmButton ? (
        <ButtonBase
          onClick={onConfirmPayment}
          disabled={isProcessing}
          sx={{
            width: '100%',
            bgcolor: colors.danger.default,
            color: colors.white.default,
            py: 1.6,
            borderRadius: '12px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            boxShadow: `0 4px 14px 0 ${alpha(colors.danger.default, 0.3)}`,
            transition: 'all 0.15s ease-in-out',
            opacity: isProcessing ? 0.7 : 1,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            '&:hover': {
              bgcolor: colors.danger.dark,
              boxShadow: `0 6px 18px 0 ${alpha(colors.danger.default, 0.4)}`,
            },
          }}
        >
          {isProcessing
            ? 'Processing Payment...'
            : compact
              ? `Confirm Payment (Rs ${formatRs(total)})`
              : 'Confirm Payment'}
        </ButtonBase>
      ) : null}

      {!compact ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            mt: 1.5,
            mb: 1,
          }}
        >
          <Box
            component="span"
            sx={{ display: 'inline-flex', color: 'text.disabled', alignItems: 'center' }}
          >
            <Lock size={12} />
          </Box>
          <Typography
            sx={{
              fontSize: '0.71875rem',
              color: 'text.disabled',
              fontWeight: 500,
            }}
          >
            Secured by 256-bit encryption
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

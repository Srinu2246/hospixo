'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import Switch from '@mui/material/Switch';
import InputBase from '@mui/material/InputBase';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { CreditCard, QrCode, Lock, MessageSquare, MessageCircle } from 'lucide-react';

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
 * - Customer notification subcard with toggle, phone input, and SMS/WhatsApp triggers
 */
export function PaymentMethodSection({
  total,
  selectedMethod,
  onSelectMethod,
  onConfirmPayment,
  isProcessing = false,
  sx,
}: Readonly<PaymentMethodSectionProps>) {
  const [sendDetails, setSendDetails] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [notifiedChannel, setNotifiedChannel] = useState<'sms' | 'whatsapp' | null>(null);

  const handleChannelNotify = (channel: 'sms' | 'whatsapp') => {
    setNotifiedChannel(channel);
    setTimeout(() => setNotifiedChannel(null), 2000);
  };

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

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        p: { xs: 2.5, sm: 3 },
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
      {/* 1. Card Header                                                */}
      {/* ------------------------------------------------------------- */}
      <Typography
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: 'text.primary',
          mb: 2.5,
        }}
      >
        PAYMENT METHOD
      </Typography>

      {/* ------------------------------------------------------------- */}
      {/* 2. Selectable Payment Options List                            */}
      {/* ------------------------------------------------------------- */}
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMethod === option.id;

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
                bgcolor: isSelected
                  ? colors.primary.dark
                  : (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : 'background.paper',
                color: isSelected ? colors.white.default : 'text.primary',
                border: isSelected ? 'none' : '1px solid',
                borderColor: isSelected ? 'transparent' : 'divider',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: isSelected ? colors.primary.hover : 'action.hover',
                },
              }}
            >
              {/* Left Icon + Label */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                {renderMethodIcon(option.id, isSelected)}
                <Typography
                  sx={{
                    fontSize: '0.9375rem',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? colors.white.default : 'text.primary',
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
                    ? `2px solid ${colors.white.default}`
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
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: colors.white.default,
                    }}
                  />
                )}
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>

      {/* ------------------------------------------------------------- */}
      {/* 3. Total Row & Confirm Payment Button                         */}
      {/* ------------------------------------------------------------- */}
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
          Rs {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>

      {/* Vibrant Coral Confirm Payment CTA */}
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
        {isProcessing ? 'Processing Payment...' : 'Confirm Payment'}
      </ButtonBase>

      {/* 256-bit Encryption Note */}
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

      {/* ------------------------------------------------------------- */}
      {/* 4. Customer Communication Sub-card                            */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.default,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '14px',
          p: 2,
          mt: 2,
        }}
      >
        {/* Toggle Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            Send order details to customer
          </Typography>

          <Switch
            checked={sendDetails}
            onChange={(e) => setSendDetails(e.target.checked)}
            size="small"
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: colors.primary.default,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: colors.primary.default,
              },
            }}
          />
        </Box>

        {sendDetails && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              Customer phone number
            </Typography>

            {/* Phone Input */}
            <Box
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                p: '8px 12px',
                '&:focus-within': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <InputBase
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                sx={{
                  fontSize: '0.875rem',
                  color: 'text.primary',
                }}
              />
            </Box>

            {/* SMS & WhatsApp Action Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <ButtonBase
                onClick={() => handleChannelNotify('sms')}
                sx={{
                  flex: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <MessageSquare size={16} strokeWidth={2} />
                {notifiedChannel === 'sms' ? 'Sent!' : 'SMS'}
              </ButtonBase>

              <ButtonBase
                onClick={() => handleChannelNotify('whatsapp')}
                sx={{
                  flex: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <MessageCircle size={16} strokeWidth={2} />
                {notifiedChannel === 'whatsapp' ? 'Sent!' : 'WhatsApp'}
              </ButtonBase>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}

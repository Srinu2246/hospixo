'use client';

import type { LucideIcon } from 'lucide-react';
import { Banknote, CreditCard, Gift, QrCode, Wallet } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import type { CashCounterPayments as CashCounterPaymentValues } from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';

const PAYMENT_METHODS: ReadonlyArray<{
  key: keyof CashCounterPaymentValues;
  title: string;
  hint: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    key: 'cash',
    title: 'Cash',
    hint: 'Accept cash payments.',
    icon: Banknote,
    tone: colors.success.default,
  },
  {
    key: 'card',
    title: 'Card',
    hint: 'Accept debit/credit card payments.',
    icon: CreditCard,
    tone: colors.secondary.default,
  },
  {
    key: 'upi',
    title: 'UPI',
    hint: 'Accept UPI payments.',
    icon: QrCode,
    tone: colors.warning.default,
  },
  {
    key: 'wallet',
    title: 'Wallet',
    hint: 'Accept digital wallet payments.',
    icon: Wallet,
    tone: colors.info.default,
  },
  {
    key: 'gift_card',
    title: 'Gift Card / Voucher',
    hint: 'Accept gift card and vouchers.',
    icon: Gift,
    tone: colors.danger.default,
  },
];

export function CashCounterPayments({
  payments,
  onChange,
  disabled = false,
}: Readonly<{
  payments: CashCounterPaymentValues;
  onChange?: (key: keyof CashCounterPaymentValues, checked: boolean) => void;
  disabled?: boolean;
}>) {
  return (
    <Stack spacing={1.25}>
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        return (
          <Stack
            key={method.key}
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              px: 1.5,
              py: 1.25,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: method.tone,
                bgcolor: (theme) => alpha(method.tone, theme.palette.mode === 'dark' ? 0.2 : 0.12),
              }}
            >
              <Icon size={18} />
            </Box>
            <LabeledSwitch
              title={method.title}
              hint={method.hint}
              checked={payments[method.key]}
              disabled={disabled || !onChange}
              onChange={(checked) => onChange?.(method.key, checked)}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Stack>
        );
      })}
    </Stack>
  );
}

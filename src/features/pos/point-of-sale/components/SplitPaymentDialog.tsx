'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { Check } from 'lucide-react';

import { Modal } from '@/components/shared/ui/Modal';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export interface SplitPaymentDialogProps {
  open: boolean;
  total: number;
  orderLabel: string;
  tableLabel: string;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (tipAmount: number) => void;
}

function parseAmount(value: string): number {
  const parsed = Number.parseFloat(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Split payment + tip sheet (captain checkout Figma). */
export function SplitPaymentDialog({
  open,
  total,
  orderLabel,
  tableLabel,
  isProcessing = false,
  onClose,
  onConfirm,
}: Readonly<SplitPaymentDialogProps>) {
  const [cash, setCash] = useState('500.00');
  const [upi, setUpi] = useState('1012.00');
  const [card, setCard] = useState('0.00');
  const [tip, setTip] = useState('0.00');

  const allocated = useMemo(
    () => parseAmount(cash) + parseAmount(upi) + parseAmount(card),
    [card, cash, upi],
  );
  const remaining = Math.max(0, total - allocated);
  const covered = Math.abs(total - allocated) < 0.01;

  const formatRs = (value: number) =>
    value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Checkout payment"
      subtitle={`${orderLabel} · ${tableLabel}`}
      width="100%"
      height="auto"
      padding={20}
      paperSx={{ maxWidth: 480, mx: 'auto' }}
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem' }}>
          Split payment details
        </Typography>

        {(
          [
            { label: 'Cash', value: cash, set: setCash },
            { label: 'UPI', value: upi, set: setUpi },
            { label: 'Card', value: card, set: setCard },
          ] as const
        ).map((row) => (
          <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ width: 56, fontWeight: 600, fontSize: '0.875rem' }}>
              {row.label}
            </Typography>
            <Box
              sx={{
                flex: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                px: 1.25,
                py: 0.75,
              }}
            >
              <InputBase
                value={row.value}
                onChange={(e) => row.set(e.target.value)}
                fullWidth
                sx={{ fontSize: '0.875rem' }}
              />
            </Box>
          </Box>
        ))}

        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', mb: 0.75 }}>Add Tip</Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              px: 1.25,
              py: 0.75,
            }}
          >
            <InputBase
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              fullWidth
              sx={{ fontSize: '0.875rem' }}
            />
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            Allocated Rs {formatRs(allocated)}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: covered ? colors.success.default : colors.danger.default,
            }}
          >
            Remaining Rs {formatRs(remaining)}
          </Typography>
        </Stack>

        {covered ? (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', color: colors.success.default }}
          >
            <Check size={16} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Total covered · Ready to confirm
            </Typography>
          </Stack>
        ) : null}

        <ActionButton
          variant="primary"
          fullWidth
          disabled={!covered || isProcessing}
          onClick={() => onConfirm(parseAmount(tip))}
          sx={{
            minHeight: 48,
            borderRadius: '10px',
            fontWeight: 700,
            bgcolor: colors.primary.default,
          }}
        >
          Confirm payment · Rs {formatRs(total)}
        </ActionButton>
      </Stack>
    </Modal>
  );
}

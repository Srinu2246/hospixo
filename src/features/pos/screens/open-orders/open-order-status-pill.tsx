import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import type {
  OpenOrderKitchenStatus,
  OpenOrderPaymentStatus,
} from '@/features/pos/config/open-orders';
import { getKitchenStatusLabel, getPaymentStatusLabel } from '@/features/pos/config/open-orders';

const kitchenColors: Record<OpenOrderKitchenStatus, { backgroundColor: string; color: string }> = {
  kotSent: { backgroundColor: '#dbeafe', color: '#1e3a8a' },
  ready: { backgroundColor: '#d1fae5', color: '#022c22' },
  preparing: { backgroundColor: '#fef3c7', color: '#78350f' },
  billing: { backgroundColor: '#ffedd5', color: '#7c2d12' },
};

const paymentColors: Record<OpenOrderPaymentStatus, { backgroundColor: string; color: string }> = {
  paid: { backgroundColor: '#d1fae5', color: '#022c22' },
  unpaid: { backgroundColor: '#e4e4e7', color: 'var(--foreground)' },
};

const chipSx = {
  minHeight: 28,
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.02em',
  '& .MuiChip-label': { px: 1.25 },
} as const;

export function KitchenStatusPill({ status }: Readonly<{ status: OpenOrderKitchenStatus }>) {
  const label = getKitchenStatusLabel(status);
  return (
    <Tooltip title={`Kitchen status: ${label}`}>
      <Chip size="small" label={label} sx={{ ...chipSx, ...kitchenColors[status] }} />
    </Tooltip>
  );
}

export function PaymentStatusPill({ status }: Readonly<{ status: OpenOrderPaymentStatus }>) {
  const label = getPaymentStatusLabel(status);
  return (
    <Tooltip title={`Payment status: ${label}`}>
      <Chip size="small" label={label} sx={{ ...chipSx, ...paymentColors[status] }} />
    </Tooltip>
  );
}

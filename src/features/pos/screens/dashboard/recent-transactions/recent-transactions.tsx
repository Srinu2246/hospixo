'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { PaymentMethod, RecentTransaction } from '@/features/pos/config/dashboard';
import { formatInr, getPaymentMethodLabel } from '@/features/pos/config/dashboard';
import { DashboardPanel } from '@/features/pos/screens/dashboard/dashboard-panel';

const methodChipColor: Record<PaymentMethod, 'success' | 'default' | 'primary'> = {
  upi: 'success',
  cash: 'default',
  card: 'primary',
};

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: Readonly<RecentTransactionsProps>) {
  return (
    <DashboardPanel title="Recent Transactions" titleId="recent-transactions-title">
      {transactions.length === 0 ? (
        <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
          No recent payments recorded.
        </Typography>
      ) : (
        <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {transactions.map((tx) => (
            <Stack
              key={tx.id}
              component="li"
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
            >
              <Stack spacing={0.25}>
                <Typography variant="body2" fontWeight={600}>
                  {tx.reference}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatInr(tx.amount)}
                </Typography>
              </Stack>
              <Chip
                size="small"
                label={getPaymentMethodLabel(tx.method)}
                color={methodChipColor[tx.method]}
                variant="outlined"
              />
            </Stack>
          ))}
        </Stack>
      )}
    </DashboardPanel>
  );
}

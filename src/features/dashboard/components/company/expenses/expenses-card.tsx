'use client';

import { Card, Typography } from '@mui/material';

import { companyLandingContent } from '@/features/dashboard/config/company';
import type { DashboardExpenseItem } from '@/features/dashboard/types';
import { ExpenseSummaryBody } from '@/features/dashboard/components/shared/expense-summary-body';

type ExpensesCardProps = Readonly<{
  total: number;
  items: readonly DashboardExpenseItem[];
}>;

export function ExpensesCard({ total, items }: ExpensesCardProps) {
  const { title, totalLabel } = companyLandingContent.expenses;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <ExpenseSummaryBody items={items} total={total} totalLabel={totalLabel} />
    </Card>
  );
}

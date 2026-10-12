'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import { COMPANY_TODAYS_EXPENSES } from '@/lib/mocks/dashboard/dashboard.mocks';

export function TodaysExpensesCard() {
  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '12px',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        height: '100%',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: colors.text.secondary,
          textTransform: 'uppercase',
        }}
      >
        TODAY&apos;S EXPENSES
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {COMPANY_TODAYS_EXPENSES.map((item) => (
          <Box
            key={item.category}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
            }}
          >
            <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary }}>
              {item.category}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>
              {item.amount}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Total Row */}
      <Box
        sx={{
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
          Total Expenses
        </Typography>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
          ₹1,04,000
        </Typography>
      </Box>
    </Card>
  );
}

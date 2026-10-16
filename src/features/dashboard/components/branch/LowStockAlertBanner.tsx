'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export function LowStockAlertBanner() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        py: 1.5,
        borderRadius: '12px',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(234, 88, 12, 0.12)' : '#FFF7ED'),
        border: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(234, 88, 12, 0.3)' : '#FFEDD5',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(234, 88, 12, 0.2)' : '#FFEDD5',
            color: '#EA580C',
            flexShrink: 0,
          }}
        >
          <WarningAmberOutlinedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
            Low Stock Alert
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
            3 items low · 1 out of stock
          </Typography>
        </Box>
      </Box>

      <ActionButton
        size="small"
        sx={{
          bgcolor: '#EA580C',
          color: '#FFFFFF',
          fontWeight: 700,
          borderRadius: '8px',
          px: 2,
          py: 0.75,
          fontSize: '0.8125rem',
          boxShadow: '0 1px 3px rgba(234, 88, 12, 0.25)',
          '&:hover': {
            bgcolor: '#C2410C',
          },
        }}
      >
        View Inventory
      </ActionButton>
    </Box>
  );
}

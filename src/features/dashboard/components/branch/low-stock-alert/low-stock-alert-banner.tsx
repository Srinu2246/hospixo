'use client';

import Link from 'next/link';
import { Alert, Box, Button, Typography } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';

type LowStockAlertBannerProps = Readonly<{
  lowCount: number;
  outOfStockCount: number;
  inventoryHref: string;
}>;

export function LowStockAlertBanner({
  lowCount,
  outOfStockCount,
  inventoryHref,
}: LowStockAlertBannerProps) {
  if (lowCount <= 0 && outOfStockCount <= 0) {
    return null;
  }

  const { title, message, cta } = branchDashboardCopy.lowStockAlert;

  return (
    <Alert
      severity="warning"
      icon={<AlertTriangle size={20} />}
      action={
        <Button
          component={Link}
          href={inventoryHref}
          size="small"
          color="warning"
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            borderRadius: '0.5rem',
          }}
        >
          {cta}
        </Button>
      }
      sx={{
        borderRadius: '0.5rem',
        alignItems: 'center',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {message(lowCount, outOfStockCount)}
        </Typography>
      </Box>
    </Alert>
  );
}

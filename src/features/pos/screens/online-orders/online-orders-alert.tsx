'use client';

import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { OnlineOrder } from '@/features/pos/config/online-orders';
import { onlineOrdersAlert } from '@/features/pos/config/online-orders';

interface OnlineOrdersAlertProps {
  highlightOrder?: OnlineOrder | null;
}

export function OnlineOrdersAlert({ highlightOrder = null }: Readonly<OnlineOrdersAlertProps>) {
  if (!highlightOrder || highlightOrder.actionState !== 'pendingAccept') {
    return null;
  }

  const message = `Order ${highlightOrder.orderNumber} just arrived — accept within 2 minutes to avoid auto-cancel.`;

  return (
    <Alert
      severity="warning"
      icon={false}
      sx={{
        mb: 2,
        borderRadius: 'var(--pos-radius-md)',
        bgcolor: '#fff7ed',
        color: '#7c2d12',
        border: '1px solid #fed7aa',
        '& .MuiAlert-message': { width: '100%', p: 0 },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Chip
          label={onlineOrdersAlert.badge}
          size="small"
          sx={{
            height: 24,
            bgcolor: '#ea580c',
            color: '#fff',
            fontWeight: 700,
            fontSize: 11,
          }}
        />
        <Typography component="p" variant="body2" sx={{ fontWeight: 600, fontSize: 14 }}>
          {message}
        </Typography>
      </Stack>
    </Alert>
  );
}

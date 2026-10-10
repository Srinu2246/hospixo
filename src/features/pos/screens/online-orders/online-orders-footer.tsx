'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { onlineOrdersFooter } from '@/features/pos/config/online-orders';

function StatusDot() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: 'var(--pos-success)',
        flexShrink: 0,
      }}
    />
  );
}

export function OnlineOrdersFooter() {
  return (
    <Stack
      component="footer"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        mt: 3,
        p: '14px 18px',
        border: 1,
        borderColor: 'var(--pos-border)',
        borderRadius: 'var(--pos-radius-sm)',
        bgcolor: 'var(--muted)',
      }}
    >
      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: '12px 20px' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <StatusDot />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
            {onlineOrdersFooter.printerStatus}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <StatusDot />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, fontWeight: 500 }}>
            {onlineOrdersFooter.syncStatus}
          </Typography>
        </Stack>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ m: 0, fontSize: 13, fontWeight: 500 }}
      >
        {onlineOrdersFooter.avgPrepTime}
      </Typography>
    </Stack>
  );
}

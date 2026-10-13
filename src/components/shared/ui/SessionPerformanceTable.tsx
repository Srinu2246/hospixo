'use client';

import { Box, LinearProgress, Typography } from '@mui/material';

export type SessionPerformanceRow = Readonly<{
  id: string;
  session: string;
  sharePercent: number;
  orders: number;
  sales: string;
}>;

export type SessionPerformanceTableProps = Readonly<{
  rows: readonly SessionPerformanceRow[];
}>;

const columnHeaderSx = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'text.secondary',
} as const;

export function SessionPerformanceTable({ rows }: SessionPerformanceTableProps) {
  return (
    <Box>
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns:
            'minmax(120px, 1fr) minmax(180px, 2fr) minmax(80px, 0.75fr) minmax(100px, 1fr)',
          gap: 2,
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography sx={columnHeaderSx}>Session</Typography>
        <Typography sx={columnHeaderSx}>Share of net sales</Typography>
        <Typography sx={columnHeaderSx}>Orders</Typography>
        <Typography sx={{ ...columnHeaderSx, textAlign: 'right' }}>Sales</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: { xs: 0, sm: 1.5 } }}>
        {rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'minmax(120px, 1fr) minmax(180px, 2fr) minmax(80px, 0.75fr) minmax(100px, 1fr)',
              },
              gap: { xs: 1, sm: 2 },
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.session}</Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
                minWidth: 0,
              }}
            >
              <LinearProgress
                variant="determinate"
                value={row.sharePercent}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    bgcolor: 'info.main',
                  },
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                  minWidth: '3rem',
                  textAlign: 'right',
                }}
              >
                {row.sharePercent.toFixed(1)}%
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {row.orders.toLocaleString('en-IN')}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, textAlign: { sm: 'right' } }}>
              {row.sales}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';

export function RevenueForecastCard() {
  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '14px',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0'),
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
        boxShadow: (theme) =>
          theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.06)',
        display: 'flex',
        flexDirection: 'column',
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
          pb: 1.5,
        }}
      >
        REVENUE FORECAST (AI-POWERED)
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          borderRadius: '12px',
          border: '1px dashed',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : '#CBD5E1',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
          textAlign: 'center',
          minHeight: 220,
          flex: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <AccessTimeOutlinedIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
        </Box>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          Coming Soon...
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: colors.text.secondary,
            maxWidth: 260,
            lineHeight: 1.5,
          }}
        >
          Revenue Forecast is still in development.
        </Typography>
      </Box>
    </Card>
  );
}

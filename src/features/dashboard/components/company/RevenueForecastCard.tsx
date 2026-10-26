'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';

export function RevenueForecastCard() {
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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: colors.text.secondary,
              textTransform: 'uppercase',
            }}
          >
            REVENUE FORECAST (AI-POWERED)
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary, mt: 0.5 }}>
            Predicted 7-Day Revenue
          </Typography>
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mt: 0.5,
            }}
          >
            ₹3,42,850
          </Typography>
        </Box>

        {/* High Confidence Badge */}
        <Box
          component="span"
          sx={{
            px: { xs: 0.75, md: 0.875, lg: 1.25 },
            py: { xs: 0.25, md: 0.3, lg: 0.35 },
            borderRadius: '9999px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.15)' : '#EFF4FE',
            color: colors.primary.default,
            fontSize: { xs: '0.5625rem', md: '0.5625rem', lg: '0.6875rem' },
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: { xs: '-0.01em', md: '-0.01em', lg: 'normal' },
            whiteSpace: 'nowrap',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}
        >
          High Confidence
        </Box>
      </Box>

      {/* Smooth SVG Projection Curve Area Chart */}
      <Box sx={{ width: '100%', height: 120, pt: 1 }}>
        <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="forecastGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B59F8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1B59F8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d="M 0 100 Q 80 70, 140 90 T 260 50 T 400 30 L 400 120 L 0 120 Z"
            fill="url(#forecastGrad)"
          />

          {/* Line stroke */}
          <path
            d="M 0 100 Q 80 70, 140 90 T 260 50 T 400 30"
            fill="none"
            stroke="#1B59F8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </Box>
    </Card>
  );
}

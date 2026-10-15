'use client';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';

export function CustomerInsightsCard() {
  const theme = useTheme();
  const bgCircleStroke = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E5E7EB';

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Intensity matrix (0: light, 1: medium, 2: vibrant, 3: dark)
  const HEATMAP_DATA = [
    [0, 1, 2, 2, 3, 2, 1], // Morning
    [1, 2, 3, 3, 3, 3, 2], // Afternoon
    [2, 3, 3, 3, 3, 3, 3], // Evening
    [1, 1, 2, 2, 2, 3, 1], // Night
  ];

  const getCellColor = (val: number) => {
    switch (val) {
      case 0:
        return 'rgba(27, 89, 248, 0.15)';
      case 1:
        return 'rgba(27, 89, 248, 0.35)';
      case 2:
        return 'rgba(27, 89, 248, 0.65)';
      case 3:
      default:
        return '#1B59F8';
    }
  };

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
        CUSTOMER INSIGHTS
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '130px 1fr' },
          gap: 3,
          alignItems: 'center',
        }}
      >
        {/* Left: 72% Return Donut */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ position: 'relative', width: 90, height: 90 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r="36"
                fill="transparent"
                stroke={bgCircleStroke}
                strokeWidth="10"
              />
              <circle
                cx="45"
                cy="45"
                r="36"
                fill="transparent"
                stroke="#00C49F"
                strokeWidth="10"
                strokeDasharray={`${(72 / 100) * 226.2} 226.2`}
                strokeLinecap="round"
                transform="rotate(-90 45 45)"
              />
            </svg>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                72%
              </Typography>
              <Typography sx={{ fontSize: '0.5625rem', color: colors.text.secondary }}>
                Return
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: Average Order Value & Heatmap */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
          {/* AOV Stat */}
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
              Average Order Value
            </Typography>
            <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
              ₹412
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#16A34A', fontWeight: 700 }}>
              ↑ 5.2%
            </Typography>
          </Box>

          {/* Peak Hours Heatmap */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary, mb: 0.25 }}>
              Peak Hours Heatmap
            </Typography>

            {/* Days Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: 0.5 }}>
              <Box />
              {DAYS.map((d, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontSize: '0.5625rem',
                    textAlign: 'center',
                    color: colors.text.secondary,
                    fontWeight: 700,
                  }}
                >
                  {d}
                </Typography>
              ))}
            </Box>

            {/* Rows */}
            {SLOTS.map((slot, rowIdx) => (
              <Box
                key={slot}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '70px repeat(7, 1fr)',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.5625rem',
                    color: colors.text.secondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {slot}
                </Typography>

                {HEATMAP_DATA[rowIdx].map((val, colIdx) => (
                  <Box
                    key={colIdx}
                    sx={{
                      height: 14,
                      borderRadius: '3px',
                      bgcolor: getCellColor(val),
                      transition: 'transform 0.1s ease',
                      '&:hover': {
                        transform: 'scale(1.2)',
                      },
                    }}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import { ORG_TAX_BREAKDOWN, ORG_FINANCIAL_BREAKDOWN } from '@/lib/mocks/dashboard/dashboard.mocks';

export function OperationsSummarySection() {
  // Compute SVG Donut segments for Tax Summary
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

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
        gap: 2.5,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: colors.text.secondary,
          textTransform: 'uppercase',
        }}
      >
        OPERATIONS SUMMARY
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: { xs: 3, md: 5 },
          rowGap: 4,
          alignItems: 'center',
        }}
      >
        {/* Left Column: Tax Summary */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
            Tax Summary
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* SVG Donut Chart */}
            <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <g transform="rotate(-90 70 70)">
                  {ORG_TAX_BREAKDOWN.map((item) => {
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += item.percentage;

                    return (
                      <circle
                        key={item.label}
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="14"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  })}
                </g>
              </svg>

              {/* Center Total Text */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                  ₹111.3k
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                  Total
                </Typography>
              </Box>
            </Box>

            {/* Tax Legend Items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
              {ORG_TAX_BREAKDOWN.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}
                  >
                    {item.amount}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Column: Financial Breakdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
            Financial Breakdown
          </Typography>

          {/* Stacked Horizontal Bar */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              height: 12,
              borderRadius: '6px',
              overflow: 'hidden',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
            }}
          >
            {ORG_FINANCIAL_BREAKDOWN.map((item) => (
              <Box
                key={item.label}
                sx={{
                  width: `${item.percentage}%`,
                  height: '100%',
                  bgcolor: item.color,
                  transition: 'width 0.3s ease',
                }}
              />
            ))}
          </Box>

          {/* Financial Breakdown Legend & Amounts */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: '100%', pt: 0.5 }}>
            {ORG_FINANCIAL_BREAKDOWN.map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary }}>
                    {item.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                  {item.amount}{' '}
                  <Box
                    component="span"
                    sx={{ color: colors.text.secondary, fontWeight: 500, fontSize: '0.75rem' }}
                  >
                    ({item.percentage}%)
                  </Box>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

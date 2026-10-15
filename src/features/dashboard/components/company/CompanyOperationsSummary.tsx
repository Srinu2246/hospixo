'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import {
  ORG_TAX_BREAKDOWN,
  COMPANY_DISCOUNTS_BREAKDOWN,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { buildDonutSegments } from '@/lib/helpers/donutChartSegments';

export function CompanyOperationsSummary() {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const taxSegments = buildDonutSegments(ORG_TAX_BREAKDOWN, circumference);
  const discountSegments = buildDonutSegments(COMPANY_DISCOUNTS_BREAKDOWN, circumference);

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
        {/* Left: Tax Summary Donut */}
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
            {/* SVG Donut */}
            <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <g transform="rotate(-90 70 70)">
                  {taxSegments.map((item) => (
                    <circle
                      key={item.label}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={item.strokeDasharray}
                      strokeDashoffset={item.strokeDashoffset}
                    />
                  ))}
                </g>
              </svg>

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

            {/* Tax Legend */}
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

        {/* Right: Discounts Summary Donut */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
            Discounts Summary
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* SVG Donut */}
            <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <g transform="rotate(-90 70 70)">
                  {discountSegments.map((item) => (
                    <circle
                      key={item.label}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={item.strokeDasharray}
                      strokeDashoffset={item.strokeDashoffset}
                    />
                  ))}
                </g>
              </svg>

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
                  ₹73.5k
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                  Total
                </Typography>
              </Box>
            </Box>

            {/* Discounts Legend */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
              {COMPANY_DISCOUNTS_BREAKDOWN.map((item) => (
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
      </Box>
    </Card>
  );
}

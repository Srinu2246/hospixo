'use client';

import React from 'react';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { buildDonutSegments } from '@/lib/helpers/donutChartSegments';
import type { TaxItem } from '@/features/dashboard/types/dashboard.types';
import { ORG_TAX_BREAKDOWN } from '@/lib/mocks/dashboard/dashboard.mocks';
import { colors } from '@/lib/theme/mui/colors';

export interface OperationsSummarySectionProps {
  taxBreakdown?: readonly TaxItem[];
  taxTotal?: string;
}

export function OperationsSummarySection({
  taxBreakdown,
  taxTotal,
}: Readonly<OperationsSummarySectionProps> = {}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const taxRows = taxBreakdown ?? ORG_TAX_BREAKDOWN;
  const taxCenter = taxTotal ?? '₹111.3k';
  const taxSegments = buildDonutSegments(taxRows, circumference);

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
                  {taxCenter}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                  Total
                </Typography>
              </Box>
            </Box>

            {/* Tax Legend Items */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
              {taxRows.map((item) => (
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
          <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
            Financial Breakdown
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              borderRadius: '10px',
              border: '1px dashed',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F9FAFB',
              textAlign: 'center',
              minHeight: 140,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.25,
              }}
            >
              <AccessTimeOutlinedIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
            </Box>

            <Typography
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              Coming Soon
            </Typography>

            <Typography
              sx={{
                fontSize: '0.6875rem',
                color: colors.text.secondary,
                maxWidth: 240,
                lineHeight: 1.45,
              }}
            >
              Financial breakdown is still in development and will be available in the next release.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

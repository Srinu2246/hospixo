'use client';

import { Box, Card, Stack, Typography, useTheme } from '@mui/material';
import { ArrowDown, ArrowUp } from 'lucide-react';

import { companyLandingContent } from '@/features/dashboard/config/company';
import { formatCurrency, formatPercent } from '@/features/dashboard/lib/format';

type CustomerInsightsCardProps = Readonly<{
  newCustomerRate: number;
  averageOrderValue: number;
  aovChangePercent: number;
  peakHours: readonly (readonly number[])[];
}>;

function cellOpacity(value: number, max: number) {
  const ratio = max > 0 ? value / max : 0;
  return Math.max(0.12, ratio);
}

export function CustomerInsightsCard({
  newCustomerRate,
  averageOrderValue,
  aovChangePercent,
  peakHours,
}: CustomerInsightsCardProps) {
  const theme = useTheme();
  const max = Math.max(...peakHours.flat(), 1);
  const returnRate = Math.max(0, 100 - newCustomerRate);
  const {
    title,
    newLabel,
    returnLabel,
    averageOrderLabel,
    heatmapTitle,
    dayLabels,
    timeSlotLabels,
  } = companyLandingContent.customerInsights;

  const infoColor = theme.palette.info.main;
  const successColor = theme.palette.success.main;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1.5fr' },
          gap: 3,
          alignItems: 'center',
        }}
      >
        {/* Gauge block */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background:
                  newCustomerRate > 0
                    ? `conic-gradient(${infoColor} 0 ${newCustomerRate}%, ${successColor} ${newCustomerRate}% 100%)`
                    : theme.palette.divider,
              }}
              aria-hidden="true"
            />
            <Box
              sx={{
                position: 'absolute',
                inset: '22%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: 'background.paper',
              }}
            >
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary' }}>
                {newCustomerRate}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
                {newLabel}
              </Typography>
            </Box>
          </Box>

          <Stack spacing={0.75} sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: infoColor }} />
                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                  {newLabel}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {newCustomerRate}%
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: successColor }} />
                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                  {returnLabel}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {returnRate}%
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Right column: AOV & Heatmap */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {averageOrderLabel}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary' }}>
                {formatCurrency(averageOrderValue)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: aovChangePercent >= 0 ? 'success.main' : 'error.main',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {aovChangePercent < 0 ? (
                  <ArrowDown size={14} aria-hidden />
                ) : (
                  <ArrowUp size={14} aria-hidden />
                )}
                {formatPercent(aovChangePercent)}
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
            >
              {heatmapTitle}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `auto repeat(${dayLabels.length}, 1fr)`,
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              <Box />
              {dayLabels.map((day, index) => (
                <Typography
                  key={`${day}-${index}`}
                  variant="caption"
                  sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.6875rem' }}
                >
                  {day}
                </Typography>
              ))}

              {peakHours.map((row, rowIndex) => (
                <Box key={timeSlotLabels[rowIndex]} sx={{ display: 'contents' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.625rem',
                      pr: 0.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {timeSlotLabels[rowIndex]}
                  </Typography>
                  {row.map((val, colIndex) => (
                    <Box
                      key={colIndex}
                      title={`${timeSlotLabels[rowIndex]} ${dayLabels[colIndex]}: ${val}`}
                      sx={{
                        height: 14,
                        borderRadius: 0.5,
                        bgcolor: val > 0 ? theme.palette.primary.main : 'action.hover',
                        opacity: val > 0 ? cellOpacity(val, max) : 0.3,
                        transition: 'opacity 0.15s',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

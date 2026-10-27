'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

import { Card } from '@/components/shared/ui/Card';
import { buildDonutSegments, type DonutSegment } from '@/lib/helpers/donutChartSegments';
import type { TaxItem } from '@/features/dashboard/types/dashboard.types';
import { ORG_TAX_BREAKDOWN } from '@/lib/mocks/dashboard/dashboard.mocks';
import { colors } from '@/lib/theme/mui/colors';

const DONUT_SIZE = 140;
const DONUT_RADIUS = 54;

interface OperationsDonutPanelProps {
  title: string;
  centerValue: string;
  segments: DonutSegment[];
  breakdown: readonly TaxItem[];
}

function OperationsDonutPanel({
  title,
  centerValue,
  segments,
  breakdown,
}: Readonly<OperationsDonutPanelProps>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        <Box sx={{ position: 'relative', width: DONUT_SIZE, height: DONUT_SIZE, flexShrink: 0 }}>
          <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox="0 0 140 140">
            <g transform="rotate(-90 70 70)">
              {segments.length > 0 ? (
                segments.map((item) => (
                  <circle
                    key={item.label}
                    cx="70"
                    cy="70"
                    r={DONUT_RADIUS}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="14"
                    strokeDasharray={item.strokeDasharray}
                    strokeDashoffset={item.strokeDashoffset}
                  />
                ))
              ) : (
                <circle
                  cx="70"
                  cy="70"
                  r={DONUT_RADIUS}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="14"
                />
              )}
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
            <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
              {centerValue}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: '100%' }}>
          {breakdown.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary }} noWrap>
                  {item.label}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  flexShrink: 0,
                }}
              >
                {item.amount}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function DiscountsComingSoonPanel() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
        Discounts Summary
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
          borderColor: '#CBD5E1',
          bgcolor: '#F8FAFC',
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
            bgcolor: '#EFF6FF',
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
          Discounts Summary is still in development.
        </Typography>
      </Box>
    </Box>
  );
}

export interface CompanyOperationsSummaryProps {
  taxBreakdown?: readonly TaxItem[];
  taxTotal?: string;
}

export function CompanyOperationsSummary({
  taxBreakdown,
  taxTotal,
}: Readonly<CompanyOperationsSummaryProps> = {}) {
  const circumference = 2 * Math.PI * DONUT_RADIUS;
  const taxRows = taxBreakdown ?? ORG_TAX_BREAKDOWN;
  const taxCenter = taxTotal ?? '₹0';
  const taxSegments = buildDonutSegments(taxRows, circumference);

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
        gap: 2.5,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: colors.text.secondary,
          textTransform: 'uppercase',
        }}
      >
        OPERATIONS SUMMARY
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          gap: { xs: 3, md: 0 },
        }}
      >
        <OperationsDonutPanel
          title="Tax Summary"
          centerValue={taxCenter}
          segments={taxSegments}
          breakdown={taxRows}
        />

        <Divider
          sx={{
            display: { xs: 'block', md: 'none' },
            borderColor: '#E2E8F0',
          }}
        />

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: 'none', md: 'block' },
            mx: { md: 4, lg: 6 },
            borderColor: '#E2E8F0',
          }}
        />

        <DiscountsComingSoonPanel />
      </Box>
    </Card>
  );
}

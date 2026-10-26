'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { buildDonutSegments, type DonutSegment } from '@/lib/helpers/donutChartSegments';
import {
  ORG_TAX_BREAKDOWN,
  COMPANY_DISCOUNTS_BREAKDOWN,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { colors } from '@/lib/theme/mui/colors';

const DONUT_SIZE = 140;
const DONUT_RADIUS = 54;

type BreakdownLegendRow = Readonly<{ label: string; amount: string; color: string }>;

interface OperationsDonutPanelProps {
  title: string;
  centerValue: string;
  segments: DonutSegment[];
  breakdown: readonly BreakdownLegendRow[];
}

function OperationsDonutPanel({
  title,
  centerValue,
  segments,
  breakdown,
}: Readonly<OperationsDonutPanelProps>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: 'text.primary' }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box sx={{ position: 'relative', width: DONUT_SIZE, height: DONUT_SIZE, flexShrink: 0 }}>
          <svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox="0 0 140 140">
            <g transform="rotate(-90 70 70)">
              {segments.map((item) => (
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
              {centerValue}
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
              Total
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
          {breakdown.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                {item.amount}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export function CompanyOperationsSummary() {
  const circumference = 2 * Math.PI * DONUT_RADIUS;
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
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: colors.text.secondary,
          textTransform: 'uppercase',
          mb: 1.25,
        }}
      >
        OPERATIONS SUMMARY
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch',
          gap: { xs: 3, sm: 0 },
        }}
      >
        <OperationsDonutPanel
          title="Tax Summary"
          centerValue="₹111.3k"
          segments={taxSegments}
          breakdown={ORG_TAX_BREAKDOWN}
        />

        <Divider
          sx={{
            display: { xs: 'block', sm: 'none' },
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          }}
        />

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            display: { xs: 'none', sm: 'block' },
            mx: { sm: 4, md: 5 },
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          }}
        />

        <OperationsDonutPanel
          title="Discounts Summary"
          centerValue="₹73.5k"
          segments={discountSegments}
          breakdown={COMPANY_DISCOUNTS_BREAKDOWN}
        />
      </Box>
    </Card>
  );
}

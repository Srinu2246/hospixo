'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';

const RETURN_RATE = 72;
const DONUT_BLUE = '#1B59F8';
const DONUT_GREEN = '#00C49F';
const MOBILE_DONUT_SIZE = 90;
const DESKTOP_DONUT_SIZE = 132;

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

const HEATMAP_DATA: readonly (readonly number[])[] = [
  [0, 1, 2, 2, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 2],
  [2, 3, 3, 3, 3, 3, 3],
  [1, 1, 2, 2, 2, 3, 1],
];

function getCellColor(val: number): string {
  switch (val) {
    case 0:
      return 'rgba(27, 89, 248, 0.15)';
    case 1:
      return 'rgba(27, 89, 248, 0.35)';
    case 2:
      return 'rgba(27, 89, 248, 0.65)';
    case 3:
    default:
      return DONUT_BLUE;
  }
}

function AverageOrderValueBlock({ value }: Readonly<{ value?: string }>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <Typography
        sx={{ fontSize: { xs: '0.75rem', md: '0.8125rem' }, color: colors.text.secondary }}
      >
        Average Order Value
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography
          sx={{
            fontSize: { xs: '1.0625rem', md: '1.375rem' },
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.2,
          }}
        >
          {value ?? '₹412'}
        </Typography>
      </Box>
    </Box>
  );
}

function ReturnDonut({ size, ratePercent }: Readonly<{ size: number; ratePercent: number }>) {
  const radius = size * 0.386;
  const strokeWidth = size * 0.1;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const greenLength = (ratePercent / 100) * circumference;
  const blueLength = circumference - greenLength;
  const isLarge = size >= 120;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={DONUT_BLUE}
            strokeWidth={strokeWidth}
            strokeDasharray={`${blueLength} ${greenLength}`}
            strokeLinecap="round"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={DONUT_GREEN}
            strokeWidth={strokeWidth}
            strokeDasharray={`${greenLength} ${blueLength}`}
            strokeDashoffset={-blueLength}
            strokeLinecap="round"
          />
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
        <Typography
          sx={{
            fontSize: isLarge ? '1.375rem' : '0.9375rem',
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.1,
          }}
        >
          {ratePercent}%
        </Typography>
        <Typography
          sx={{ fontSize: isLarge ? '0.75rem' : '0.5625rem', color: colors.text.secondary }}
        >
          Return
        </Typography>
      </Box>
    </Box>
  );
}

function PeakHoursHeatmap() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
      <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary, mb: 0.25 }}>
        Peak Hours Heatmap
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: 0.5 }}>
        <Box />
        {DAYS.map((day, index) => (
          <Typography
            key={`${day}-${index}`}
            sx={{
              fontSize: '0.5625rem',
              textAlign: 'center',
              color: colors.text.secondary,
              fontWeight: 700,
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

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

          {HEATMAP_DATA[rowIdx]?.map((val, colIdx) => (
            <Box
              key={`${slot}-${colIdx}`}
              sx={{
                height: { xs: 14, md: 16 },
                borderRadius: '4px',
                bgcolor: getCellColor(val),
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export interface CustomerInsightsCardProps {
  averageOrderValue?: string;
  retentionRate?: number | null;
}

export function CustomerInsightsCard({
  averageOrderValue,
  retentionRate,
}: Readonly<CustomerInsightsCardProps> = {}) {
  const theme = useTheme();
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up('md'));
  const donutSize = isDesktopLayout ? DESKTOP_DONUT_SIZE : MOBILE_DONUT_SIZE;
  const returnRate = retentionRate ?? RETURN_RATE;

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
        height: '100%',
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
        CUSTOMER INSIGHTS
      </Typography>

      <Box
        sx={{
          display: 'grid',
          flex: 1,
          alignItems: { xs: 'center', md: 'stretch' },
          columnGap: { md: 4 },
          rowGap: { xs: 2.5, md: 3 },
          gridTemplateColumns: { xs: 'auto 1fr', md: 'auto 1fr' },
          gridTemplateAreas: {
            xs: `"donut aov" "heat heat"`,
            md: `"donut aov" "donut heat"`,
          },
        }}
      >
        <Box
          sx={{
            gridArea: 'donut',
            gridRow: { md: '1 / 3' },
            alignSelf: { md: 'center' },
            pl: { md: 1 },
          }}
        >
          <ReturnDonut size={donutSize} ratePercent={returnRate} />
        </Box>

        <Box
          sx={{
            gridArea: 'aov',
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            pl: { xs: 1.5, md: 2.5 },
          }}
        >
          <AverageOrderValueBlock value={averageOrderValue} />
        </Box>

        <Box sx={{ gridArea: 'heat', minWidth: 0 }}>
          <PeakHoursHeatmap />
        </Box>
      </Box>
    </Card>
  );
}

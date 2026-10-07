'use client';

import { Box, Typography, useTheme } from '@mui/material';

import { buildAreaChartPaths } from '@/features/dashboard/lib/area-chart';

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 130;

type AreaLineChartProps = Readonly<{
  series: readonly number[];
  gradientId: string;
  ariaLabel: string;
  showDots?: boolean;
  alignToColumns?: boolean;
  activeIndex?: number | null;
}>;

export function AreaLineChart({
  series,
  gradientId,
  ariaLabel,
  showDots = false,
  alignToColumns = false,
  activeIndex = null,
}: AreaLineChartProps) {
  const theme = useTheme();

  if (series.length === 0 || series.every((v) => v === 0)) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 130 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          No chart data available.
        </Typography>
      </Box>
    );
  }

  const chart = buildAreaChartPaths(series, {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    alignToColumns,
  });

  const infoColor = theme.palette.info.main;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      sx={{
        width: '100%',
        height: 130,
        display: 'block',
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={infoColor} stopOpacity="0.22" />
          <stop offset="55%" stopColor={infoColor} stopOpacity="0.08" />
          <stop offset="100%" stopColor={infoColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={chart.area} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={infoColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={chart.line}
      />
      {showDots
        ? chart.points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r={activeIndex === index ? 5 : 3.5}
              fill={activeIndex === index ? theme.palette.primary.main : infoColor}
              stroke={theme.palette.background.paper}
              strokeWidth="2"
            />
          ))
        : null}
    </Box>
  );
}

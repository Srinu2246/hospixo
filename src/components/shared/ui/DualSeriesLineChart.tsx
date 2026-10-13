'use client';

import { useId } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export type DualSeriesLineChartProps = Readonly<{
  title?: string;
  xLabels: readonly string[];
  primarySeries: readonly number[];
  comparisonSeries: readonly number[];
  primaryLegendLabel: string;
  comparisonLegendLabel: string;
  highlightedLabel?: string;
  formatYAxisValue?: (value: number) => string;
  yAxisStep?: number;
  ariaLabel: string;
  height?: number;
}>;

type ChartPoint = Readonly<{ x: number; y: number }>;

const PLOT_WIDTH = 1000;
const DEFAULT_HEIGHT = 200;
const PLOT_PADDING = 16;

function computeYMax(values: readonly number[], step: number): number {
  const max = Math.max(...values, 0);
  if (max === 0) return step;
  return Math.ceil(max / step) * step;
}

function buildSeriesPoints(
  series: readonly number[],
  plotHeight: number,
  yMax: number,
): readonly ChartPoint[] {
  const count = series.length;
  if (count === 0) return [];

  return series.map((value, index) => {
    const x = ((index + 0.5) / count) * PLOT_WIDTH;
    const y = plotHeight - PLOT_PADDING - (value / yMax) * (plotHeight - PLOT_PADDING * 2);
    return { x, y };
  });
}

function pointsToPolyline(points: readonly ChartPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function pointsToArea(points: readonly ChartPoint[], plotHeight: number): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return [
    `M0,${plotHeight}`,
    `L${first.x},${first.y}`,
    ...points.slice(1).map((point) => `L${point.x},${point.y}`),
    `L${last.x},${plotHeight}`,
    'Z',
  ].join(' ');
}

function defaultFormatYAxisInr(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function DualSeriesLineChart({
  title,
  xLabels,
  primarySeries,
  comparisonSeries,
  primaryLegendLabel,
  comparisonLegendLabel,
  highlightedLabel,
  formatYAxisValue = defaultFormatYAxisInr,
  yAxisStep = 20_000,
  ariaLabel,
  height = DEFAULT_HEIGHT,
}: DualSeriesLineChartProps) {
  const gradientId = useId().replace(/:/g, '');
  const theme = useTheme();
  const plotHeight = height;
  const primaryColor = theme.palette.info.main;
  const comparisonColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[400];
  const gridColor = alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.55 : 1);

  const allValues = [...primarySeries, ...comparisonSeries];
  const yMax = computeYMax(allValues, yAxisStep);
  const yTicks = Array.from({ length: yMax / yAxisStep + 1 }, (_, index) => index * yAxisStep);

  const primaryPoints = buildSeriesPoints(primarySeries, plotHeight, yMax);
  const comparisonPoints = buildSeriesPoints(comparisonSeries, plotHeight, yMax);
  const highlightedIndex = highlightedLabel
    ? xLabels.findIndex((label) => label.toLowerCase() === highlightedLabel.toLowerCase())
    : -1;
  const highlightX =
    highlightedIndex >= 0 && xLabels.length > 0
      ? ((highlightedIndex + 0.5) / xLabels.length) * PLOT_WIDTH
      : null;

  if (primarySeries.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
          No chart data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {title ? (
        <Typography sx={{ mb: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
          {title}
        </Typography>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
        <Box
          sx={{
            width: 56,
            flexShrink: 0,
            height: plotHeight,
            display: 'flex',
            flexDirection: 'column-reverse',
            justifyContent: 'space-between',
            pb: `${PLOT_PADDING}px`,
            pt: `${PLOT_PADDING}px`,
          }}
        >
          {yTicks.map((tick) => (
            <Typography
              key={tick}
              sx={{
                fontSize: '0.6875rem',
                color: 'text.secondary',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {formatYAxisValue(tick)}
            </Typography>
          ))}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            component="svg"
            viewBox={`0 0 ${PLOT_WIDTH} ${plotHeight}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={ariaLabel}
            sx={{ width: '100%', height: plotHeight, display: 'block' }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = plotHeight - PLOT_PADDING - (tick / yMax) * (plotHeight - PLOT_PADDING * 2);
              return (
                <line
                  key={tick}
                  x1={0}
                  y1={y}
                  x2={PLOT_WIDTH}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                />
              );
            })}

            {highlightX != null ? (
              <line
                x1={highlightX}
                y1={PLOT_PADDING}
                x2={highlightX}
                y2={plotHeight - PLOT_PADDING}
                stroke={alpha(primaryColor, 0.35)}
                strokeWidth={1}
              />
            ) : null}

            <path d={pointsToArea(primaryPoints, plotHeight)} fill={`url(#${gradientId})`} />

            {comparisonPoints.length > 0 ? (
              <polyline
                fill="none"
                stroke={comparisonColor}
                strokeWidth={2}
                strokeDasharray="6 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsToPolyline(comparisonPoints)}
              />
            ) : null}

            <polyline
              fill="none"
              stroke={primaryColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsToPolyline(primaryPoints)}
            />

            {primaryPoints.map((point, index) => (
              <circle
                key={`primary-${point.x}-${point.y}`}
                cx={point.x}
                cy={point.y}
                r={highlightedIndex === index ? 5 : 4}
                fill={theme.palette.background.paper}
                stroke={primaryColor}
                strokeWidth={2}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 0.75,
              px: 0.25,
            }}
          >
            {xLabels.map((label) => {
              const active =
                highlightedLabel != null && label.toLowerCase() === highlightedLabel.toLowerCase();
              return (
                <Typography
                  key={label}
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: active ? 700 : 600,
                    color: active ? 'info.main' : 'text.secondary',
                    flex: 1,
                    textAlign: 'center',
                  }}
                >
                  {label}
                </Typography>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 20, height: 0, borderTop: `2px solid ${primaryColor}` }} />
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {primaryLegendLabel}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 0,
              borderTop: `2px dashed ${comparisonColor}`,
            }}
          />
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {comparisonLegendLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

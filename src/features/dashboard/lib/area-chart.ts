export type AreaChartPoint = Readonly<{
  x: number;
  y: number;
}>;

export type AreaChartPaths = Readonly<{
  line: string;
  area: string;
  points: readonly AreaChartPoint[];
}>;

type BuildAreaChartOptions = Readonly<{
  width: number;
  height: number;
  padding?: number;
  /** Place each point at the center of an equal column — aligns with labels below. */
  alignToColumns?: boolean;
}>;

export function buildAreaChartPaths(
  series: readonly number[],
  options: BuildAreaChartOptions,
): AreaChartPaths {
  const { width, height, padding = 12, alignToColumns = false } = options;

  if (series.length === 0) {
    return { line: '', area: '', points: [] };
  }

  const max = Math.max(...series, 1);
  const count = series.length;

  const points = series.map((value, index) => {
    let x: number;

    if (alignToColumns) {
      x = ((index + 0.5) / count) * width;
    } else if (count > 1) {
      x = (index / (count - 1)) * width;
    } else {
      x = width / 2;
    }

    const y = height - padding - (value / max) * (height - padding * 2);
    return { x, y };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = [
    `M0,${height}`,
    ...points.map((point) => `L${point.x},${point.y}`),
    `L${width},${height}`,
    'Z',
  ].join(' ');

  return { line, area, points };
}

export type DonutSegment = {
  label: string;
  color: string;
  percentage: number;
  strokeDasharray: string;
  strokeDashoffset: number;
};

export function buildDonutSegments(
  items: ReadonlyArray<{ label: string; color: string; percentage: number }>,
  circumference: number,
): DonutSegment[] {
  let accumulatedPercent = 0;
  return items.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return { ...item, strokeDasharray, strokeDashoffset };
  });
}

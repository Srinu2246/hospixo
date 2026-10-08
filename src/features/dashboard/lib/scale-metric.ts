import type { DashboardMetric } from '@/features/dashboard/types';

export function scaleAmount(amount: number, scaleFactor: number): number {
  return Math.max(0, Math.round(amount * scaleFactor));
}

export function scaleMetric(
  metric: DashboardMetric,
  scaleFactor: number,
  changePercent: number,
  changeLabel: string,
): DashboardMetric {
  return {
    ...metric,
    amount: scaleAmount(metric.amount, scaleFactor),
    changePercent: metric.changePercent !== 0 ? metric.changePercent : changePercent,
    changeLabel,
  };
}

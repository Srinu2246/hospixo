import {
  Activity,
  Briefcase,
  Building2,
  Clock3,
  MapPin,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { DashboardMetric } from '@/types/dashboard';
import { formatChangePercent, formatMetricValue } from '@/helpers/dashboard/format';
import { cn } from '@/helpers/cn';

import styles from './dashboard-metrics.module.css';

const metricIcons: Record<string, LucideIcon> = {
  'total-organizations': Building2,
  'active-organizations': Activity,
  'trial-organizations': Clock3,
  'total-companies': Briefcase,
  'total-branches': MapPin,
  'total-users': Users,
};

type DashboardMetricsProps = Readonly<{
  metrics: readonly DashboardMetric[];
}>;

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className={styles.metrics}>
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.id] ?? Building2;
        const isPositive = metric.changePercent > 0;
        const isNegative = metric.changePercent < 0;
        const TrendIcon = isNegative ? TrendingDown : TrendingUp;

        return (
          <article key={metric.id} className={styles.card}>
            <div className={styles.cardTop}>
              <p className={styles.label}>{metric.label}</p>
              <span className={styles.iconWrap} aria-hidden>
                <Icon className={styles.icon} />
              </span>
            </div>
            <p className={styles.value}>{formatMetricValue(metric.value)}</p>
            <p className={styles.delta}>
              <span
                className={cn(
                  styles.deltaValue,
                  isPositive && styles.deltaPositive,
                  isNegative && styles.deltaNegative,
                  !isPositive && !isNegative && styles.deltaNeutral,
                )}
              >
                <TrendIcon className={styles.deltaIcon} aria-hidden />
                {formatChangePercent(metric.changePercent)}
              </span>
              <span className={styles.deltaLabel}> {metric.changeLabel}</span>
            </p>
          </article>
        );
      })}
    </div>
  );
}

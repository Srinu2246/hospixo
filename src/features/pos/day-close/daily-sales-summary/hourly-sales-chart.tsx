import { dailySalesHourlyTrend } from '@/features/pos/day-close/config/daily-sales-summary';

import styles from './hourly-sales-chart.module.css';

export function HourlySalesChart() {
  const maxValue = Math.max(...dailySalesHourlyTrend.map((point) => point.value));

  return (
    <section className={styles.card} aria-labelledby="hourly-sales-heading">
      <h2 id="hourly-sales-heading" className={styles.title}>
        Hourly Sales Trend
      </h2>

      <div className={styles.chart} role="img" aria-label="Hourly sales bar chart">
        {dailySalesHourlyTrend.map((point) => (
          <div key={point.id} className={styles.barColumn}>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{ height: `${(point.value / maxValue) * 100}%` }}
              />
            </div>
            <span className={styles.label}>{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

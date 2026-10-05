import type { DashboardBreakdownItem } from '@/features/dashboard/types';
import { formatCompactCurrency } from '@/features/dashboard/lib/format';

import styles from './summary-donut-card.module.css';

type SummaryDonutCardProps = Readonly<{
  title: string;
  total: number;
  items: readonly DashboardBreakdownItem[];
}>;

function buildDonutGradient(items: readonly DashboardBreakdownItem[], total: number) {
  let cursor = 0;

  return items
    .map((item) => {
      const share = total > 0 ? (item.amount / total) * 100 : 0;
      const start = cursor;
      cursor += share;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(', ');
}

export function SummaryDonutCard({ title, total, items }: SummaryDonutCardProps) {
  const gradient = buildDonutGradient(items, total);

  return (
    <section className={styles.card}>
      <p className={styles.title}>{title}</p>
      <div className={styles.content}>
        <div className={styles.donutWrap}>
          <div
            className={styles.donut}
            style={{ background: `conic-gradient(${gradient})` }}
            aria-hidden="true"
          />
          <div className={styles.donutCenter}>
            <span className={styles.total}>{formatCompactCurrency(total)}</span>
          </div>
        </div>
        <div className={styles.legend}>
          {items.map((item) => (
            <div key={item.label} className={styles.legendItem}>
              <div className={styles.legendLabel}>
                <span className={styles.legendSwatch} style={{ backgroundColor: item.color }} />
                <span className={styles.legendText}>
                  {item.label}
                  {item.shareLabel ? (
                    <span className={styles.legendShare}> ({item.shareLabel})</span>
                  ) : null}
                </span>
              </div>
              <span className={styles.legendValue}>{formatCompactCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

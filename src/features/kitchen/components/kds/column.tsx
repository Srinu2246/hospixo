import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { KdsOrder, KdsOrderStatus } from '@/types/kds';

type KdsColumnProps = Readonly<{
  styles: Readonly<Record<string, string>>;
  status: KdsOrderStatus;
  title: string;
  emptyLabel: string;
  orders: readonly KdsOrder[];
  count?: number;
  idPrefix: string;
  renderCard: (order: KdsOrder) => ReactNode;
}>;

function columnTone(styles: Readonly<Record<string, string>>, status: KdsOrderStatus) {
  if (status === 'new') return styles.toneNew;
  if (status === 'preparing') return styles.tonePreparing;
  return styles.toneReady;
}

export function KdsColumn({
  styles,
  status,
  title,
  emptyLabel,
  orders,
  count,
  idPrefix,
  renderCard,
}: KdsColumnProps) {
  const tone = columnTone(styles, status);
  const headingId = `${idPrefix}-${status}`;

  return (
    <section className={cn(styles.column, tone)} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        <span className={styles.count}>{count ?? orders.length}</span>
      </header>

      <div className={styles.list}>
        {orders.length === 0 ? (
          <p className={styles.empty}>{emptyLabel}</p>
        ) : (
          orders.map((order) => renderCard(order))
        )}
      </div>
    </section>
  );
}

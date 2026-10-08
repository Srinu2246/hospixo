import type { OnlinePlatformStat } from '@/features/pos/config/dashboard';
import { formatInr } from '@/features/pos/config/dashboard';

import styles from './online-orders-panel.module.css';

interface OnlineOrdersPanelProps {
  totalSales: number;
  orders: number;
  platforms: OnlinePlatformStat[];
}

const platformInitials: Record<string, string> = {
  zomato: 'Z',
  swiggy: 'S',
  growthfalcons: 'G',
};

const platformTone: Record<string, string> = {
  zomato: styles.logoZomato,
  swiggy: styles.logoSwiggy,
  growthfalcons: styles.logoGrowth,
};

export function OnlineOrdersPanel({
  totalSales,
  orders,
  platforms,
}: Readonly<OnlineOrdersPanelProps>) {
  return (
    <section className={styles.panel} aria-labelledby="online-orders-title">
      <header className={styles.header}>
        <h2 id="online-orders-title" className={styles.title}>
          Online Orders
        </h2>
      </header>

      <div className={styles.summary}>
        <div>
          <p className={styles.summaryLabel}>Total Online Sales</p>
          <p className={styles.summaryValue}>{formatInr(totalSales)}</p>
        </div>
        <div>
          <p className={styles.summaryLabel}>Orders</p>
          <p className={styles.summaryValue}>{orders}</p>
        </div>
      </div>

      <ul className={styles.platformList}>
        {platforms.map((platform) => (
          <li key={platform.id} className={styles.platformRow}>
            <div className={styles.platformMeta}>
              <span
                className={`${styles.platformLogo} ${platformTone[platform.id] ?? ''}`}
                aria-hidden
              >
                {platformInitials[platform.id] ?? platform.name[0]}
              </span>
              <span className={styles.platformName}>{platform.name}</span>
            </div>
            <span className={styles.platformCount}>{platform.orders}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

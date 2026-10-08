import type { DashboardSummaryCard, DashboardSummaryIcon } from '@/features/pos/config/dashboard';
import { Banknote, ChefHat, ClipboardList, UtensilsCrossed } from 'lucide-react';

import styles from './summary-cards.module.css';

const iconMap: Record<DashboardSummaryIcon, React.ElementType> = {
  totalOrders: UtensilsCrossed,
  pendingOrders: ClipboardList,
  ordersReady: ChefHat,
  openBills: Banknote,
};

const iconTone: Record<DashboardSummaryIcon, string> = {
  totalOrders: styles.iconBlue,
  pendingOrders: styles.iconOrange,
  ordersReady: styles.iconGreen,
  openBills: styles.iconBlue,
};

interface SummaryCardsProps {
  cards: DashboardSummaryCard[];
}

export function SummaryCards({ cards }: Readonly<SummaryCardsProps>) {
  return (
    <section className={styles.grid} aria-label="Dashboard summary">
      {cards.map((card) => {
        const Icon = iconMap[card.icon];
        return (
          <article key={card.id} className={styles.card}>
            <div className={styles.cardTop}>
              <p className={styles.label}>{card.label}</p>
              <span className={`${styles.iconWrap} ${iconTone[card.icon]}`} aria-hidden>
                <Icon size={18} />
              </span>
            </div>
            <p className={styles.value}>{card.value}</p>
            <p className={styles.trend}>{card.trend}</p>
          </article>
        );
      })}
    </section>
  );
}

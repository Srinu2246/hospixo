import Link from 'next/link';
import {
  Building2,
  ChevronRight,
  CreditCard,
  Headphones,
  Plus,
  type LucideIcon,
} from 'lucide-react';

import { dashboardPageCopy } from '@/constants/admin/dashboard';
import type { DashboardQuickAction } from '@/types/dashboard';

import styles from './quick-actions.module.css';

const actionIcons: Record<string, LucideIcon> = {
  'create-organization': Plus,
  'view-organizations': Building2,
  subscriptions: CreditCard,
  support: Headphones,
};

type QuickActionsProps = Readonly<{
  actions: readonly DashboardQuickAction[];
}>;

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section className={styles.panel} aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className={styles.title}>
        {dashboardPageCopy.quickActionsTitle}
      </h2>

      <div className={styles.list}>
        {actions.map((action) => {
          const Icon = actionIcons[action.id] ?? Building2;

          return (
            <Link key={action.id} href={action.href} className={styles.card}>
              <span className={styles.iconWrap} aria-hidden>
                <Icon className={styles.icon} />
              </span>
              <div className={styles.content}>
                <p className={styles.cardTitle}>{action.title}</p>
                <p className={styles.cardDescription}>{action.description}</p>
              </div>
              <ChevronRight className={styles.chevron} aria-hidden />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

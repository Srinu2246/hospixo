import Link from 'next/link';

import { routes } from '@/constants/routes';
import { dashboardPageCopy } from '@/constants/admin/dashboard';
import { activityStatusLabel, formatRelativeTime } from '@/helpers/dashboard/format';
import type { DashboardActivityItem } from '@/types/dashboard';
import { cn } from '@/helpers/cn';

import styles from './recent-activity.module.css';

type RecentActivityProps = Readonly<{
  items: readonly DashboardActivityItem[];
}>;

function badgeClass(status: DashboardActivityItem['status']) {
  switch (status) {
    case 'created':
      return styles.badgeCreated;
    case 'warning':
      return styles.badgeWarning;
    case 'trial':
      return styles.badgeTrial;
    case 'failed':
      return styles.badgeFailed;
    default:
      return styles.badgeCreated;
  }
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className={styles.panel} aria-labelledby="recent-activity-heading">
      <div className={styles.header}>
        <h2 id="recent-activity-heading" className={styles.title}>
          {dashboardPageCopy.recentActivityTitle}
        </h2>
        <Link href={routes.admin.audit} className={styles.link}>
          {dashboardPageCopy.recentActivityLink}
        </Link>
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.itemMain}>
              <p className={styles.orgName}>{item.companyName}</p>
              <p className={styles.description}>{item.description}</p>
            </div>
            <div className={styles.itemMeta}>
              <span className={cn(styles.badge, badgeClass(item.status))}>
                {activityStatusLabel(item.status)}
              </span>
              <time className={styles.time} dateTime={item.occurredAt}>
                {formatRelativeTime(item.occurredAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

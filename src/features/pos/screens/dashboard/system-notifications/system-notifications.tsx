import type { NotificationSeverity, SystemNotification } from '@/features/pos/config/dashboard';
import { getNotificationSeverityLabel } from '@/features/pos/config/dashboard';

import styles from './system-notifications.module.css';

const severityDot: Record<NotificationSeverity, string> = {
  critical: styles.dotCritical,
  completed: styles.dotCompleted,
  warning: styles.dotWarning,
  info: styles.dotInfo,
};

const severityLabel: Record<NotificationSeverity, string> = {
  critical: styles.labelCritical,
  completed: styles.labelCompleted,
  warning: styles.labelWarning,
  info: styles.labelInfo,
};

interface SystemNotificationsProps {
  notifications: SystemNotification[];
}

export function SystemNotifications({ notifications }: Readonly<SystemNotificationsProps>) {
  return (
    <section className={styles.panel} aria-labelledby="system-notifications-title">
      <header className={styles.header}>
        <h2 id="system-notifications-title" className={styles.title}>
          System Notifications
        </h2>
      </header>

      <ul className={styles.list}>
        {notifications.map((notification) => (
          <li key={notification.id} className={styles.row}>
            <div className={styles.meta}>
              <span className={`${styles.dot} ${severityDot[notification.severity]}`} aria-hidden />
              <span className={styles.titleText}>{notification.title}</span>
            </div>
            <span className={`${styles.severity} ${severityLabel[notification.severity]}`}>
              {getNotificationSeverityLabel(notification.severity)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { setupStatusLabels } from '@/features/floor-table-setup/config';
import type { SetupStatus } from '@/features/floor-table-setup/types/floor-table-setup';
import { cn } from '@/lib/utils';

import styles from './status-badge.module.css';

const statusClass: Record<SetupStatus, string> = {
  active: styles.active,
  draft: styles.draft,
  archived: styles.archived,
  maintenance: styles.draft,
  inactive: styles.archived,
};

type FloorStatusBadgeProps = Readonly<{
  status: SetupStatus;
}>;

export function FloorStatusBadge({ status }: FloorStatusBadgeProps) {
  return <span className={cn(styles.badge, statusClass[status])}>{setupStatusLabels[status]}</span>;
}

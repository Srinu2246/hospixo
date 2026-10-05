import type { OrganizationStatus } from '@/types/organization';
import { cn } from '@/helpers/cn';

import styles from './status-badge.module.css';

type StatusBadgeProps = Readonly<{
  status: OrganizationStatus | 'paid';
  label?: string;
}>;

function resolveLabel(status: StatusBadgeProps['status'], label?: string) {
  if (label) return label;
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'suspended':
      return 'Suspended';
    case 'trial':
      return 'Trial';
    case 'expiring':
      return 'Expiring';
    case 'draft':
      return 'Draft';
    case 'cancelled':
      return 'Cancelled';
    case 'disabled':
      return 'Disabled';
    case 'paid':
      return 'Paid';
    default:
      return status;
  }
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        styles.badge,
        status === 'active' && styles.active,
        status === 'inactive' && styles.inactive,
        status === 'suspended' && styles.suspended,
        status === 'trial' && styles.trial,
        status === 'expiring' && styles.expiring,
        status === 'draft' && styles.draft,
        status === 'cancelled' && styles.cancelled,
        status === 'disabled' && styles.disabled,
        status === 'paid' && styles.paid,
      )}
    >
      {resolveLabel(status, label)}
    </span>
  );
}

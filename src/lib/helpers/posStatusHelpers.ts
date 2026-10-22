import type {
  PosSystemNotification,
  TableStatus,
} from '@/lib/schemas/pos/point-of-sale/dashboard/posDashboardSchema';

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  vacant: '#10B981',
  occupied: '#3354F4',
  reserved: '#F59E0B',
  cleaning: '#6B7280',
};

export const FLOOR_LEGEND_CONFIG = [
  { label: 'Vacant', color: TABLE_STATUS_COLORS.vacant },
  { label: 'Occupied', color: TABLE_STATUS_COLORS.occupied },
  { label: 'Reserved', color: TABLE_STATUS_COLORS.reserved },
  { label: 'Cleaning', color: TABLE_STATUS_COLORS.cleaning },
] as const;

export function getTableStatusColor(status: TableStatus): string {
  return TABLE_STATUS_COLORS[status];
}

const NOTIFICATION_SEVERITY_COLORS: Record<PosSystemNotification['severity'], string> = {
  critical: '#EF4444',
  completed: '#10B981',
  pending: '#F59E0B',
  offline: '#EF4444',
};

export function getNotificationSeverityColor(severity: PosSystemNotification['severity']): string {
  return NOTIFICATION_SEVERITY_COLORS[severity];
}

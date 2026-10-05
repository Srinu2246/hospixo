import type { AdminDashboardOverview, DashboardActivityStatus } from '@/types/dashboard';

export function formatMetricValue(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatChangePercent(changePercent: number): string {
  const prefix = changePercent > 0 ? '+' : '';
  return `${prefix}${changePercent}%`;
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / (60 * 1000));
  const hours = Math.round(absMs / (60 * 60 * 1000));
  const days = Math.round(absMs / (24 * 60 * 60 * 1000));

  if (minutes < 60) {
    return diffMs <= 0 ? `${minutes} min ago` : `in ${minutes} min`;
  }
  if (hours < 48) {
    return diffMs <= 0 ? `${hours} hours ago` : `in ${hours} hours`;
  }
  if (days === 1) {
    return diffMs <= 0 ? 'Yesterday' : 'Tomorrow';
  }
  return diffMs <= 0 ? `${days} days ago` : `in ${days} days`;
}

export function activityStatusLabel(status: DashboardActivityStatus): string {
  switch (status) {
    case 'created':
      return 'Created';
    case 'warning':
      return 'Warning';
    case 'trial':
      return 'Trial';
    case 'failed':
      return 'Failed';
    default:
      return status;
  }
}

export function resolveQuickActions(
  overview: AdminDashboardOverview,
  fallback: AdminDashboardOverview['quickActions'],
) {
  return overview.quickActions ?? fallback ?? [];
}

'use client';

import { dashboardPageCopy, dashboardQuickActions } from '@/constants/admin/dashboard';
import { useDashboardOverview } from '@/hooks/dashboard/useDashboardOverview';
import { resolveQuickActions } from '@/helpers/dashboard/format';

import { DashboardSkeleton } from '../dashboard-skeleton/dashboard-skeleton';
import { DashboardMetrics } from '../dashboard-metrics/dashboard-metrics';
import { QuickActions } from '../quick-actions/quick-actions';
import { RecentActivity } from '../recent-activity/recent-activity';

import styles from './dashboard-page.module.css';

export function DashboardPageContent() {
  const { data: overview, error, isPending } = useDashboardOverview();

  const errorMessage =
    error instanceof Error ? error.message : error ? 'Failed to load dashboard' : null;

  if (errorMessage && !overview) {
    return (
      <div className={styles.page}>
        <p style={{ color: 'var(--destructive)' }}>Failed to load dashboard: {errorMessage}</p>
      </div>
    );
  }

  if (!overview || isPending) {
    return <DashboardSkeleton />;
  }

  const quickActions = resolveQuickActions(overview, dashboardQuickActions);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{dashboardPageCopy.title}</h1>
        <p className={styles.subtitle}>{dashboardPageCopy.subtitle}</p>
      </header>

      <DashboardMetrics metrics={overview.metrics} />

      <div className={styles.lowerGrid}>
        <RecentActivity items={overview.recentActivity} />
        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}

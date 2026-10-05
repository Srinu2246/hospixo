import { Skeleton } from '@/components/ui/skeleton/skeleton';

import pageStyles from '../dashboard-page/dashboard-page.module.css';
import skeletonStyles from './dashboard-skeleton.module.css';

export function DashboardSkeleton() {
  return (
    <div className={pageStyles.page} aria-busy="true" aria-live="polite">
      <header className={pageStyles.header}>
        <Skeleton className={skeletonStyles.title} />
        <Skeleton className={skeletonStyles.subtitle} />
      </header>
      <div className={skeletonStyles.metrics}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className={skeletonStyles.metricCard} />
        ))}
      </div>
      <div className={pageStyles.lowerGrid}>
        <Skeleton className={skeletonStyles.panel} />
        <Skeleton className={skeletonStyles.panel} />
      </div>
    </div>
  );
}

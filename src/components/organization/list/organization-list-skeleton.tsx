import { Skeleton } from '@/components/ui/skeleton/skeleton';

import styles from './organization-list.module.css';
import skeletonStyles from './organization-list-skeleton.module.css';

export function OrganizationListSkeleton() {
  return (
    <div className={styles.page} aria-busy="true" aria-live="polite">
      <Skeleton className={skeletonStyles.breadcrumb} />
      <div className={styles.header}>
        <Skeleton className={skeletonStyles.title} />
        <Skeleton className={skeletonStyles.button} />
      </div>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Skeleton className={skeletonStyles.filter} />
          <Skeleton className={skeletonStyles.filter} />
          <Skeleton className={skeletonStyles.filter} />
        </div>
        <Skeleton className={skeletonStyles.search} />
      </div>
      <div className={styles.tableWrap}>
        <div className={skeletonStyles.tableSkeleton}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className={skeletonStyles.tableRow} />
          ))}
        </div>
      </div>
      <div className={styles.pagination}>
        <Skeleton className={skeletonStyles.paginationText} />
        <div className={styles.paginationControls}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className={skeletonStyles.pageButton} />
          ))}
        </div>
      </div>
    </div>
  );
}

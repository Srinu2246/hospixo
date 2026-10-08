import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import styles from './empty-state.module.css';

type EmptyStateProps = Readonly<{
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  variant?: 'card' | 'hero' | 'error';
}>;

export function EmptyState({
  title,
  description,
  action,
  icon,
  variant = 'card',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        styles.empty,
        variant === 'hero' && styles.hero,
        variant === 'error' && styles.error,
      )}
    >
      {icon ? (
        <div className={styles.iconWrap} aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

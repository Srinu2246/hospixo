import type { CSSProperties } from 'react';

import { cn } from '@/helpers/cn';

import styles from './skeleton.module.css';

type SkeletonProps = Readonly<{
  className?: string;
  block?: boolean;
  style?: CSSProperties;
}>;

export function Skeleton({ className, block = true, style }: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, block && styles.block, className)}
      style={style}
      aria-hidden="true"
    />
  );
}

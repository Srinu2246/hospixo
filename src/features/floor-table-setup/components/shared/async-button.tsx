'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

import styles from './async-button.module.css';

type AsyncButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingLabel?: string;
    children: ReactNode;
  }
>;

/** Preserves button width while showing a loading label. */
export function AsyncButton({
  loading = false,
  loadingLabel,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: AsyncButtonProps) {
  const label = loading ? (loadingLabel ?? children) : children;

  return (
    <button
      type={type}
      className={cn(styles.button, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className={styles.label} aria-hidden={loading}>
        {children}
      </span>
      {loading ? <span className={styles.loadingLabel}>{label}</span> : null}
    </button>
  );
}

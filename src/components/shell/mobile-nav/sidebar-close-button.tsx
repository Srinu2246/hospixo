'use client';

import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

import styles from './mobile-nav.module.css';

type SidebarCloseButtonProps = Readonly<{
  onClick?: () => void;
  variant?: 'dark' | 'light';
  className?: string;
}>;

export function SidebarCloseButton({
  onClick,
  variant = 'dark',
  className,
}: SidebarCloseButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        styles.close,
        variant === 'dark' ? styles.closeOnDark : styles.closeOnLight,
        className,
      )}
      onClick={onClick}
      aria-label="Close navigation"
    >
      <X className={styles.closeIcon} aria-hidden />
    </button>
  );
}

'use client';

import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import styles from './mobile-nav.module.css';

type MobileNavToggleProps = Readonly<{
  open: boolean;
  onClick: () => void;
  className?: string;
}>;

export function MobileNavToggle({ open, onClick, className }: MobileNavToggleProps) {
  return (
    <button
      type="button"
      className={cn(styles.toggle, className)}
      onClick={onClick}
      aria-label={open ? 'Close navigation' : 'Open navigation'}
      aria-expanded={open}
    >
      {open ? (
        <X className={styles.toggleIcon} aria-hidden />
      ) : (
        <Menu className={styles.toggleIcon} aria-hidden />
      )}
    </button>
  );
}

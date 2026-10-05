'use client';

import { cn } from '@/lib/utils';

import styles from './mobile-nav.module.css';

type MobileNavOverlayProps = Readonly<{
  open: boolean;
  onClose: () => void;
  className?: string;
}>;

export function MobileNavOverlay({ open, onClose, className }: MobileNavOverlayProps) {
  if (!open) return null;

  return (
    <button
      type="button"
      className={cn(styles.overlay, styles.overlayVisible, className)}
      onClick={onClose}
      aria-label="Close navigation backdrop"
    />
  );
}

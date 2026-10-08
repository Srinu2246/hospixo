'use client';

import { Bell, ChevronLeft } from 'lucide-react';

import { MobileNavOverlay, MobileNavToggle } from '@/components/shell/mobile-nav';
import { usePosUserProfile } from '@/features/pos/hooks/use-pos-user-profile';
import {
  PosOperationsSidebar,
  type PosOperationsSidebarVariant,
} from '@/features/pos/screens/layout/pos-operations-sidebar';
import { useMobileNav } from '@/hooks/use-mobile-nav';
import { cn } from '@/lib/utils';

import styles from './pos-mobile-header.module.css';

interface PosMobileHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'checkout';
  sidebarVariant?: PosOperationsSidebarVariant;
  onBack?: () => void;
}

export function PosMobileHeader({
  title,
  subtitle,
  variant = 'default',
  sidebarVariant = 'operations',
  onBack,
}: Readonly<PosMobileHeaderProps>) {
  const { open, closeNav, toggleNav } = useMobileNav();
  const { initials } = usePosUserProfile();

  return (
    <>
      <header
        className={`${styles.header} ${variant === 'checkout' ? styles.headerCheckout : ''} ${
          onBack ? styles.headerWithBack : ''
        }`}
      >
        {onBack ? (
          <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Back">
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <Bell size={20} />
          </button>
          <div className={styles.avatar} aria-hidden>
            {initials}
          </div>
          <MobileNavToggle open={open} onClick={toggleNav} className={styles.menuToggle} />
        </div>
      </header>

      <MobileNavOverlay open={open} onClose={closeNav} className={styles.navOverlay} />
      <div className={cn(styles.navDrawer, open && styles.navDrawerOpen)} aria-hidden={!open}>
        <PosOperationsSidebar variant={sidebarVariant} onNavigate={closeNav} />
      </div>
    </>
  );
}

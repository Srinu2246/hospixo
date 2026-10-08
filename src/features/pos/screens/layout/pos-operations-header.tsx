'use client';

import { usePathname } from 'next/navigation';
import { Bell, Bot, ChevronDown, LayoutGrid, MapPin, Settings } from 'lucide-react';

import { MobileNavToggle } from '@/components/shell/mobile-nav';
import { posOperationsOutlet, posPageTitles } from '@/features/pos/config/nav-operations';
import { usePosUserProfile } from '@/features/pos/hooks/use-pos-user-profile';

import styles from './pos-operations-header.module.css';

interface PosOperationsHeaderProps {
  menuOpen?: boolean;
  onMenuToggle?: () => void;
}

export function PosOperationsHeader({
  menuOpen = false,
  onMenuToggle,
}: Readonly<PosOperationsHeaderProps>) {
  const pathname = usePathname();
  const { initials } = usePosUserProfile();
  const pageTitle = Object.entries(posPageTitles)
    .sort(([left], [right]) => right.length - left.length)
    .find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.context}>
          {onMenuToggle ? (
            <MobileNavToggle open={menuOpen} onClick={onMenuToggle} className={styles.menuToggle} />
          ) : null}
          {pageTitle ? <span className={styles.pageTitle}>{pageTitle}</span> : null}
          <button type="button" className={styles.outletBtn} aria-haspopup="listbox">
            <span className={styles.outletLabel}>{posOperationsOutlet.label}</span>
            <span className={styles.outletValue}>
              <MapPin size={16} className={styles.outletIcon} aria-hidden />
              {posOperationsOutlet.name}
              <ChevronDown size={16} aria-hidden />
            </span>
          </button>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryBtn}>
            <Bot size={16} aria-hidden />
            AI Agent
          </button>
          <button type="button" className={styles.primaryBtn}>
            <LayoutGrid size={16} aria-hidden />
            Explore Products
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Settings">
            <Settings size={18} />
          </button>
          <button type="button" className={styles.avatarBtn} aria-label="Account menu">
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
}

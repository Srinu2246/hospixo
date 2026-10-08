'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  buildPosFlowNavItems,
  posFlowFooterNav,
  posFlowProfile,
  type PosFlowNavItem,
} from '@/features/pos/config/nav-flow';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { PosFlowNavIcon } from '@/features/pos/screens/shared/pos-nav-icons';

import styles from './pos-flow-sidebar.module.css';

function isFlowNavActive(pathname: string, item: PosFlowNavItem, activeNavId: string) {
  if (item.id === activeNavId) return true;
  if (item.href.startsWith('#')) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

interface PosFlowSidebarProps {
  activeNavId: string;
  onNavigate?: () => void;
}

export function PosFlowSidebar({ activeNavId, onNavigate }: Readonly<PosFlowSidebarProps>) {
  const pathname = usePathname();
  const flowPaths = usePosFlowPaths();
  const navItems = buildPosFlowNavItems(flowPaths);

  return (
    <aside className={styles.sidebar} aria-label="POS navigation">
      <Link href={flowPaths.tables} className={styles.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG from public */}
        <img src="/logo-light.svg" alt="Hospixo" width={108} height={24} className={styles.logo} />
        <p className={styles.brandSubtitle}>OPERATIONS</p>
      </Link>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const active = isFlowNavActive(pathname, item, activeNavId);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  <PosFlowNavIcon icon={item.icon} className={styles.navIcon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link
          href={posFlowFooterNav.href}
          className={`${styles.navItem} ${activeNavId === posFlowFooterNav.id ? styles.navItemActive : ''}`}
          onClick={onNavigate}
        >
          <PosFlowNavIcon icon={posFlowFooterNav.icon} className={styles.navIcon} />
          <span>{posFlowFooterNav.label}</span>
        </Link>

        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {posFlowProfile.initials}
          </div>
          <div className={styles.profileMeta}>
            <p className={styles.profileName}>{posFlowProfile.name}</p>
            <p className={styles.profileRole}>{posFlowProfile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

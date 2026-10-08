'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { routes } from '@/config/routes';
import type { PosMobileNavId } from '@/features/pos/config/nav-mobile';
import { buildPosMobileBottomNav } from '@/features/pos/config/nav-mobile';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { PosOperationsNavIcon } from '@/features/pos/screens/shared/pos-nav-icons';

import styles from './pos-mobile-bottom-nav.module.css';

interface PosMobileBottomNavProps {
  activeNavId: PosMobileNavId;
}

function isNavActive(pathname: string, href: string) {
  if (href === routes.dashboard.captain || href === routes.dashboard.branch) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PosMobileBottomNav({ activeNavId }: Readonly<PosMobileBottomNavProps>) {
  const pathname = usePathname();
  const flowPaths = usePosFlowPaths();
  const items = buildPosMobileBottomNav(flowPaths);

  return (
    <nav className={styles.nav} aria-label="POS mobile navigation">
      {items.map((item) => {
        const active = item.id === activeNavId || isNavActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.link} ${active ? styles.linkActive : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <PosOperationsNavIcon icon={item.icon} className={styles.icon} size={20} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

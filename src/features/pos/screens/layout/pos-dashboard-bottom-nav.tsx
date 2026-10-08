'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, User } from 'lucide-react';

import {
  posDashboardMobileBottomNav,
  type PosDashboardMobileNavId,
} from '@/features/pos/config/nav-dashboard-mobile';
import { PosFlowNavIcon } from '@/features/pos/screens/shared/pos-nav-icons';

import styles from './pos-mobile-bottom-nav.module.css';

interface PosDashboardBottomNavProps {
  activeNavId: PosDashboardMobileNavId;
}

function DashboardNavIcon({
  icon,
  className,
  size = 20,
}: Readonly<{
  icon: (typeof posDashboardMobileBottomNav)[number]['icon'];
  className?: string;
  size?: number;
}>) {
  if (icon === 'dashboard' || icon === 'staff' || icon === 'financials') {
    return <PosFlowNavIcon icon={icon} className={className} size={size} />;
  }

  if (icon === 'reports') {
    return <BarChart3 className={className} size={size} aria-hidden />;
  }

  return <User className={className} size={size} aria-hidden />;
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PosDashboardBottomNav({ activeNavId }: Readonly<PosDashboardBottomNavProps>) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="POS dashboard navigation">
      {posDashboardMobileBottomNav.map((item) => {
        const active = item.id === activeNavId || isNavActive(pathname, item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.link} ${active ? styles.linkActive : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <DashboardNavIcon icon={item.icon} className={styles.icon} size={20} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

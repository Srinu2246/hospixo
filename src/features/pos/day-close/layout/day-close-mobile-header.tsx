'use client';

import Link from 'next/link';
import { ChevronDown, LayoutGrid, MapPin, Menu } from 'lucide-react';

import { useAuth } from '@/context/auth';
import { useDashboardData } from '@/context/dashboard-data';
import { useDashboardFilter } from '@/context/dashboard-filter';
import { siteConfig } from '@/config/site';
import { routes } from '@/config/routes';

import styles from './day-close-mobile-header.module.css';

interface DayCloseMobileHeaderProps {
  menuOpen: boolean;
  onMenuToggle: () => void;
}

export function DayCloseMobileHeader({
  menuOpen,
  onMenuToggle,
}: Readonly<DayCloseMobileHeaderProps>) {
  const { user } = useAuth();
  const { outletId, setOutletId } = useDashboardFilter();
  const { data } = useDashboardData();

  const outlets = data?.outlets ?? [{ id: 'all', name: 'All Outlets' }];
  const selected = outlets.find((outlet) => outlet.id === outletId) ?? outlets[0]!;

  const initials =
    [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || 'AK';

  return (
    <header className={styles.header}>
      <div className={styles.leading}>
        <Link
          href={routes.platform.pos.root}
          className={styles.logoLink}
          aria-label={siteConfig.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- brand mark SVG from public */}
          <img
            src={siteConfig.brand.logoLight}
            alt=""
            width={28}
            height={28}
            className={styles.logoMark}
          />
        </Link>

        <div className={styles.outletGroup}>
          <span className={styles.outletLabel}>Outlets</span>
          <div className={styles.selectWrap}>
            <MapPin className={styles.pinIcon} aria-hidden />
            <select
              aria-label="Select outlet"
              value={selected.id}
              onChange={(event) => setOutletId(event.target.value)}
              className={styles.select}
            >
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.selectIcon} aria-hidden />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Link
          href={routes.dashboard.settings}
          className={styles.exploreBtn}
          aria-label="Explore Products"
        >
          <LayoutGrid size={20} aria-hidden />
        </Link>
        <div className={styles.avatar} aria-hidden>
          {initials}
        </div>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="day-close-mobile-nav"
          onClick={onMenuToggle}
        >
          <Menu size={22} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </header>
  );
}

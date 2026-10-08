'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreVertical, PanelLeftClose } from 'lucide-react';
import { routes } from '@/config/routes';

import { posDashboardNavSections, posDashboardProfile } from '@/features/pos/config/nav-dashboard';
import type { PosOperationsSidebarConfig } from '@/features/pos/config/nav-operations';
import { buildPosOperationsNavSections } from '@/features/pos/config/nav-operations';
import { usePosFlowPaths } from '@/features/pos/hooks/use-pos-flow-paths';
import { usePosUserProfile } from '@/features/pos/hooks/use-pos-user-profile';
import { PosOperationsNavIcon } from '@/features/pos/screens/shared/pos-nav-icons';

import styles from './pos-operations-sidebar.module.css';

export type PosOperationsSidebarVariant = 'operations' | 'dashboard';

function isNavActive(pathname: string, href: string) {
  if (href.startsWith('#')) return false;
  if (href === routes.platform.pos.dashboard) {
    return pathname === href;
  }
  // Flow roots (/captain, /branch) must match exactly — not every nested route.
  if (href === routes.dashboard.captain || href === routes.dashboard.branch) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface PosOperationsSidebarProps {
  onNavigate?: () => void;
  variant?: PosOperationsSidebarVariant;
}

export function PosOperationsSidebar({
  onNavigate,
  variant = 'operations',
}: Readonly<PosOperationsSidebarProps>) {
  const pathname = usePathname();
  const flowPaths = usePosFlowPaths();
  const { name, initials, role } = usePosUserProfile();

  const resolved: PosOperationsSidebarConfig =
    variant === 'dashboard'
      ? {
          sections: posDashboardNavSections,
          profile: posDashboardProfile,
          brandHref: routes.platform.pos.dashboard,
          showCollapse: true,
          showUpgrade: true,
        }
      : {
          sections: buildPosOperationsNavSections(flowPaths),
          profile: { name, role },
          brandHref: flowPaths.tables,
          showCollapse: false,
          showUpgrade: false,
        };

  return (
    <aside className={styles.sidebarRoot} aria-label="POS operations navigation">
      {resolved.showCollapse ? (
        <div className={styles.brandRow}>
          <Link href={resolved.brandHref} className={styles.brand} onClick={onNavigate}>
            {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG from public */}
            <img
              src="/logo-light.svg"
              alt="Hospixo"
              width={108}
              height={24}
              className={styles.logo}
            />
          </Link>
          <button type="button" className={styles.collapseBtn} aria-label="Collapse sidebar">
            <PanelLeftClose size={14} />
          </button>
        </div>
      ) : (
        <Link href={resolved.brandHref} className={styles.brandStandalone} onClick={onNavigate}>
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG from public */}
          <img
            src="/logo-light.svg"
            alt="Hospixo"
            width={108}
            height={24}
            className={styles.logo}
          />
        </Link>
      )}

      <nav className={styles.nav}>
        {resolved.sections.map((section) => (
          <section key={section.id} className={styles.section} aria-label={section.title}>
            {section.title ? <h2 className={styles.sectionTitle}>{section.title}</h2> : null}
            <ul className={styles.sectionList}>
              {section.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <PosOperationsNavIcon icon={item.icon} className={styles.navIcon} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <footer className={styles.profile}>
        <div className={styles.avatar} aria-hidden>
          {initials}
        </div>
        <div className={styles.profileMeta}>
          <p className={styles.profileName}>{resolved.profile.name}</p>
          <p className={styles.profileRole}>{resolved.profile.role}</p>
        </div>
        {resolved.showUpgrade ? (
          <button type="button" className={styles.upgradeBtn}>
            Upgrade
          </button>
        ) : (
          <button type="button" className={styles.profileMenu} aria-label="Profile menu">
            <MoreVertical size={16} />
          </button>
        )}
      </footer>
    </aside>
  );
}

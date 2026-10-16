'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

import AdminNavLink from '@/components/shell/AdminNavLink';
import SidebarCloseButton from '@/components/shell/mobile-nav/SidebarCloseButton';
import { adminNavItems } from '@/constants/navigation';
import { ADMIN_ROUTES } from '@/constants/routes';
import { siteConfig } from '@/constants/site';
import { cn } from '@/helpers/cn';
import { isNavItemActive } from '@/helpers/navigation/is-nav-item-active';

import mobileNavStyles from '../mobile-nav/mobile-nav.module.css';
import styles from './sidebar.module.css';

type AdminSidebarProps = Readonly<{
  open?: boolean;
  onClose?: () => void;
}>;

export default function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { width, height } = siteConfig.brand.logoDimensions;

  return (
    <aside
      className={cn(
        styles.sidebar,
        mobileNavStyles.drawer,
        mobileNavStyles.drawerLeft,
        open && mobileNavStyles.drawerOpen,
      )}
    >
      <div className={styles.header}>
        <AdminNavLink
          href={ADMIN_ROUTES.dashboard}
          className={styles.logoLink}
          aria-label={siteConfig.name}
          onClick={onClose}
        >
          <Image
            src={siteConfig.brand.logoLight}
            alt=""
            width={width}
            height={height}
            className={styles.logo}
            priority
          />
        </AdminNavLink>
        <SidebarCloseButton onClick={onClose} variant="dark" />
      </div>
      <nav className={styles.nav} aria-label="Control plane">
        {adminNavItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href, item.id);
          const Icon = item.icon;

          return (
            <AdminNavLink
              key={item.id}
              href={item.href}
              prefetch
              className={cn(styles.link, isActive && styles.linkActive)}
              pendingClassName={styles.linkPending}
              onClick={onClose}
            >
              <Icon className={styles.icon} aria-hidden />
              <span className={styles.label}>{item.label}</span>
            </AdminNavLink>
          );
        })}
      </nav>
    </aside>
  );
}

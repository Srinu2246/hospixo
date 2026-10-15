'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  getWorkspaceMobileNav,
  isWorkspaceMobileNavActive,
  type WorkspaceMobileNavItem,
} from '@/config/shell/workspace-mobile-nav';
import { workspaceMobileChromeCopy } from '@/config/shell/workspace-mobile-chrome';
import { resolveUserInitials } from '@/lib/user/resolve-user-initials';
import { useAuth } from '@/context/auth';
import { resolveAccessLevel, resolveSidebarLevel, type AccessLevel } from '@/lib/auth/access-level';
import { cn } from '@/lib/utils';

import styles from './workspace-mobile.module.css';

type WorkspaceMobileBottomNavProps = Readonly<{
  level?: AccessLevel;
  className?: string;
}>;

function NavIcon({
  item,
  initials,
}: Readonly<{
  item: WorkspaceMobileNavItem;
  initials: string;
}>) {
  if (item.id === 'profile') {
    return <span className={styles.bottomAvatar}>{initials}</span>;
  }

  const Icon = item.icon;
  return <Icon className={styles.bottomIcon} aria-hidden />;
}

export function WorkspaceMobileBottomNav({ level, className }: WorkspaceMobileBottomNavProps) {
  const pathname = usePathname() ?? '';
  const { user } = useAuth();

  const userCeiling = user
    ? resolveAccessLevel({
        roles: user.roles ?? [],
        scope: user.scope ?? 'tenant',
        company_id: user.company_id ?? null,
        branch_id: user.branch_id ?? null,
      })
    : 'company';

  const resolvedLevel = level ?? resolveSidebarLevel(pathname, userCeiling, null);

  const items = getWorkspaceMobileNav(resolvedLevel);
  const initials = resolveUserInitials(user);

  return (
    <nav
      className={cn(styles.bottomNav, className)}
      aria-label={workspaceMobileChromeCopy.bottomNavAriaLabel}
    >
      <div className={styles.bottomNavInner}>
        {items.map((item) => {
          const active = isWorkspaceMobileNavActive(pathname, item);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(styles.bottomLink, active && styles.bottomLinkActive)}
              aria-current={active ? 'page' : undefined}
            >
              <NavIcon item={item} initials={initials} />
              <span className={styles.bottomLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

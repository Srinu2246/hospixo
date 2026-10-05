'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HelpCircle, FileText, LogOut, PenLine, Shield, UserRound } from 'lucide-react';

import { routes } from '@/config/routes';
import { useAuth } from '@/context/auth';
import { LogoutDialog } from '@/features/profile/components/logout-dialog/logout-dialog';
import { profileMenuCopy } from '@/features/profile/config/profile';
import { buildUserProfile } from '@/features/profile/lib/build-user-profile';

import styles from './profile-menu.module.css';

type ProfileMenuProps = Readonly<{
  initials: string;
}>;

const menuLinks = [
  {
    href: routes.dashboard.profile,
    label: profileMenuCopy.myProfile,
    icon: UserRound,
  },
  {
    href: routes.marketing.helpCenter,
    label: profileMenuCopy.helpSupport,
    icon: HelpCircle,
  },
  {
    href: routes.marketing.privacy,
    label: profileMenuCopy.privacyPolicy,
    icon: Shield,
  },
  {
    href: routes.marketing.terms,
    label: profileMenuCopy.termsConditions,
    icon: FileText,
  },
  {
    href: routes.marketing.blogResources,
    label: profileMenuCopy.blogs,
    icon: PenLine,
  },
] as const;

export function ProfileMenu({ initials }: ProfileMenuProps) {
  const { user } = useAuth();
  const profile = buildUserProfile(user);
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.wrap} ref={menuRef}>
      <button
        type="button"
        className={styles.avatarButton}
        aria-label={profileMenuCopy.menuLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.avatar}>{initials}</span>
      </button>

      {open ? (
        <div className={styles.menu} role="menu" aria-label={profileMenuCopy.menuLabel}>
          <div className={styles.menuHeader}>
            <span className={styles.menuAvatar}>{initials}</span>
            <div className={styles.menuIdentity}>
              <p className={styles.menuName}>{profile.name}</p>
              <p className={styles.menuRole}>{profile.roleLabel}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <ul className={styles.linkList}>
            {menuLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={styles.menuLink}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    <Icon className={styles.menuIcon} aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={styles.divider} />

          <button
            type="button"
            className={styles.logoutLink}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setLogoutOpen(true);
            }}
          >
            <LogOut className={styles.logoutIcon} aria-hidden="true" />
            {profileMenuCopy.logout}
          </button>
        </div>
      ) : null}

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </div>
  );
}

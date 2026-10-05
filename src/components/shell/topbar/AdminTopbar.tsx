'use client';

import Link from 'next/link';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import AdminLogoutDialog from '@/components/shell/topbar/AdminLogoutDialog';
import { adminTopbarCopy } from '@/constants/navigation';
import { ADMIN_ROUTES } from '@/constants/routes';

import styles from './topbar.module.css';

type AdminTopbarProps = Readonly<{
  navOpen?: boolean;
  onMenuClick?: () => void;
  userEmail?: string;
}>;

function profileLabel(userEmail?: string) {
  const email = userEmail?.trim();
  if (!email) return adminTopbarCopy.profileName;
  const local = email.split('@')[0]?.trim();
  return local || email;
}

export default function AdminTopbar({ navOpen = false, onMenuClick, userEmail }: AdminTopbarProps) {
  const displayName = profileLabel(userEmail);
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'A';
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const query = new FormData(form).get('q');
    if (typeof query !== 'string' || !query.trim()) return;
    window.location.assign(`${ADMIN_ROUTES.organizations}?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={navOpen}
      >
        {navOpen ? (
          <X className={styles.menuIcon} aria-hidden />
        ) : (
          <Menu className={styles.menuIcon} aria-hidden />
        )}
      </button>

      <form className={styles.searchForm} role="search" onSubmit={onSearchSubmit}>
        <Search className={styles.searchIcon} aria-hidden />
        <input
          type="search"
          name="q"
          className={styles.searchInput}
          placeholder={adminTopbarCopy.searchPlaceholder}
          aria-label={adminTopbarCopy.searchPlaceholder}
        />
      </form>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Notifications"
          title="Notifications coming soon"
          disabled
        >
          <Bell className={styles.actionIcon} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Messages"
          title="Messages coming soon"
          disabled
        >
          <MessageCircle className={styles.actionIcon} aria-hidden />
        </button>
        <Link
          href={ADMIN_ROUTES.support}
          className={styles.iconButton}
          aria-label="Help"
          title="Help"
        >
          <HelpCircle className={styles.actionIcon} aria-hidden />
        </Link>
        <Link
          href={ADMIN_ROUTES.settings}
          className={styles.iconButton}
          aria-label="Settings"
          title="Settings"
        >
          <Settings className={styles.actionIcon} aria-hidden />
        </Link>

        <div className={styles.profileWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.profileButton}
            aria-label={adminTopbarCopy.menuLabel}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            title={userEmail?.trim() || displayName}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className={styles.avatarFallback} aria-hidden>
              {avatarLetter}
            </span>
            <span className={styles.profileName}>{displayName}</span>
            <ChevronDown
              className={menuOpen ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
              aria-hidden
            />
          </button>

          {menuOpen ? (
            <div className={styles.profileMenu} role="menu" aria-label={adminTopbarCopy.menuLabel}>
              <div className={styles.profileMenuHeader}>
                <span className={styles.avatarFallback} aria-hidden>
                  {avatarLetter}
                </span>
                <div className={styles.profileMenuIdentity}>
                  <p className={styles.profileMenuName}>{displayName}</p>
                  {userEmail?.trim() ? (
                    <p className={styles.profileMenuEmail}>{userEmail.trim()}</p>
                  ) : null}
                </div>
              </div>
              <div className={styles.profileMenuDivider} />
              <button
                type="button"
                className={styles.logoutItem}
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
              >
                <LogOut className={styles.logoutIcon} aria-hidden />
                {adminTopbarCopy.logout}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <AdminLogoutDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </header>
  );
}

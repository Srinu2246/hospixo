'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useState, type FormEvent } from 'react';
import { Avatar, Box, Divider, Menu as MuiMenu, MenuItem, Typography } from '@mui/material';

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
  const router = useRouter();
  const displayName = profileLabel(userEmail);
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'A';
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuOpen = Boolean(profileAnchorEl);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const query = new FormData(form).get('q');
    if (typeof query !== 'string' || !query.trim()) return;
    router.push(`${ADMIN_ROUTES.organizations}?q=${encodeURIComponent(query.trim())}`);
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

        <div className={styles.profileWrap}>
          <button
            type="button"
            className={styles.profileButton}
            aria-label={adminTopbarCopy.menuLabel}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            title={userEmail?.trim() || displayName}
            onClick={(e) => setProfileAnchorEl(profileAnchorEl ? null : e.currentTarget)}
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

          <MuiMenu
            anchorEl={profileAnchorEl}
            open={menuOpen}
            onClose={() => setProfileAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  mt: 1,
                  minWidth: 230,
                  borderRadius: '0.75rem',
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)'
                      : '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)',
                  py: 0.5,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                {avatarLetter}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </Typography>
                {userEmail?.trim() ? (
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {userEmail.trim()}
                  </Typography>
                ) : null}
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                setProfileAnchorEl(null);
                setLogoutOpen(true);
              }}
              sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '0.375rem',
                mx: 0.75,
                my: 0.25,
                py: 0.75,
                px: 1.25,
                gap: 1.25,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <LogOut size={16} />
              <span>{adminTopbarCopy.logout}</span>
            </MenuItem>
          </MuiMenu>
        </div>
      </div>

      <AdminLogoutDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </header>
  );
}

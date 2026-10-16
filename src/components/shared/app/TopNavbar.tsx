'use client';

import React, { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  Box,
  Stack,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { CircleHelp, FileText, LogOut, PenLine, Shield, UserRound } from 'lucide-react';

import { LogoutModal } from '@/components/shared/app/Logout';
import { Dropdown, type DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useThemeStore } from '@/stores/themeStore';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';
import { normalizeRoleKey, type SidebarContext, type SidebarUserProfile } from '@/app/sidebar';

type ProfileMenuAction = 'profile' | 'help' | 'privacy' | 'terms' | 'blogs' | 'logout';

const PROFILE_MENU_ITEMS: ReadonlyArray<{
  id: Exclude<ProfileMenuAction, 'logout'>;
  label: string;
  icon: ReactNode;
}> = [
  { id: 'profile', label: 'My Profile', icon: <UserRound size={18} strokeWidth={1.75} /> },
  { id: 'help', label: 'Help & Support', icon: <CircleHelp size={18} strokeWidth={1.75} /> },
  { id: 'privacy', label: 'Privacy & Policy', icon: <Shield size={18} strokeWidth={1.75} /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={18} strokeWidth={1.75} /> },
  { id: 'blogs', label: 'Blogs', icon: <PenLine size={18} strokeWidth={1.75} /> },
];

export interface TopNavbarProps {
  role?: string;
  context?: SidebarContext;
  user?: SidebarUserProfile;
  onAiAgentClick?: () => void;
  onExploreProductsClick?: () => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onOpenMenu?: () => void;
}

export function TopNavbar({
  role: propRole,
  context: propContext,
  user: propUser,
  onAiAgentClick,
  onExploreProductsClick,
  onNotificationClick,
  onSettingsClick,
  onOpenMenu,
}: TopNavbarProps) {
  // Store subscriptions
  const storeRole = useSidebarStore((state) => state.role);
  const storeContext = useSidebarStore((state) => state.context);
  const setContext = useSidebarStore((state) => state.setContext);
  const storeUser = useSidebarStore((state) => state.user);
  const context = propContext ?? storeContext;

  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  const activeRole = propRole || storeRole;
  const activeUser = propUser || storeUser;
  const normalizedRole = normalizeRoleKey(activeRole);

  // Business rule: show AI Agent and Explore Products for managers/company, hide for waiter
  const showManagementActions = Boolean(normalizedRole) && normalizedRole !== 'waiter';

  const outletOptions: DropdownOption<string>[] =
    context.branchId == null
      ? []
      : [
          {
            id: String(context.branchId),
            label: context.branchName ?? `Branch ${context.branchId}`,
          },
        ];

  const selectedOutletSlug = context.branchId == null ? '' : String(context.branchId);

  const handleOutletChange = (branchId: string) => {
    const parsed = Number(branchId);
    if (!Number.isFinite(parsed)) return;
    setContext({ branchId: parsed });
  };

  const pathname = usePathname();
  const isBranchView = pathname?.includes('/branch-manager') || false;
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const closeProfileMenu = () => setProfileAnchor(null);

  const handleProfileMenuAction = (action: ProfileMenuAction) => {
    closeProfileMenu();
    if (action === 'logout') {
      setLogoutOpen(true);
    }
  };

  const displayName = activeUser?.name?.trim() || 'User';
  const displayRole = formatRoleLabel(activeUser?.role || activeRole);

  return (
    <Box
      component="header"
      id="app-top-navbar"
      sx={{
        height: 64,
        minHeight: 64,
        maxHeight: 64,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3 },
        backgroundColor: (theme) => theme.palette.background.paper,
        borderBottom: '1px solid',
        borderColor: (theme) => theme.palette.divider,
        boxSizing: 'border-box',
        zIndex: 10,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Left Section: Outlets Location Dropdown (using Dropdown component)  */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 1 }}>
        <ActionButton
          variant="icon"
          ariaLabel="Open navigation"
          onClick={onOpenMenu}
          sx={{ display: { [screen.mobile]: 'inline-flex', [screen.tablet]: 'none' } }}
        >
          <MenuOutlinedIcon sx={{ fontSize: 20 }} />
        </ActionButton>
        <Dropdown
          variant="outlet"
          label="Outlets"
          startIcon={
            <PlaceOutlinedIcon
              sx={{
                fontSize: 18,
                color: (theme) => theme.palette.text.primary,
                flexShrink: 0,
              }}
            />
          }
          options={outletOptions}
          value={selectedOutletSlug}
          onChange={handleOutletChange}
        />
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Right Section: Action buttons, Theme toggle, and Profile Avatar    */}
      {/* ------------------------------------------------------------------ */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        {/* AI Agent Button */}
        {showManagementActions && (
          <ActionButton
            variant="outlined"
            size="medium"
            startIcon={<HeadsetMicOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onAiAgentClick}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              borderRadius: '8px',
              borderColor: (theme) => theme.palette.divider,
              color: (theme) => theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '0.84375rem',
              '&:hover': {
                borderColor: (theme) => theme.palette.text.secondary,
                backgroundColor: 'action.hover',
              },
            }}
          >
            AI Agent
          </ActionButton>
        )}

        {/* Explore Products Button (hidden on branch-manager routes as per Figma) */}
        {showManagementActions && !isBranchView && (
          <ActionButton
            variant="primary"
            size="medium"
            startIcon={<GridViewOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onExploreProductsClick}
            sx={{
              borderRadius: '8px',
              backgroundColor: colors.primary.default,
              color: colors.white.default,
              fontWeight: 600,
              fontSize: '0.84375rem',
              boxShadow: `0 2px 8px ${colors.sidebar.activeGlow}`,
              '&:hover': {
                backgroundColor: colors.primary.dark,
              },
            }}
          >
            Explore Products
          </ActionButton>
        )}

        {/* Theme Toggle: Sun / Moon Handler (hidden on branch-manager routes to match Figma) */}
        {!isBranchView && (
          <Tooltip title={mode === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}>
            <span>
              <ActionButton
                variant="icon"
                size="medium"
                ariaLabel="Toggle theme mode"
                onClick={toggleMode}
                sx={{
                  borderRadius: '8px',
                  borderColor: (theme) => theme.palette.divider,
                  color: (theme) => theme.palette.text.secondary,
                  '&:hover': {
                    color: (theme) => theme.palette.text.primary,
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {mode === 'dark' ? (
                  <LightModeOutlinedIcon sx={{ fontSize: 20, color: '#FBBF24' }} />
                ) : (
                  <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
                )}
              </ActionButton>
            </span>
          </Tooltip>
        )}

        {/* Notifications Button */}
        <Tooltip title="Notifications">
          <span>
            <ActionButton
              variant="icon"
              size="medium"
              ariaLabel="View notifications"
              onClick={onNotificationClick}
              sx={{
                borderRadius: '8px',
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.secondary,
                '&:hover': {
                  color: (theme) => theme.palette.text.primary,
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </ActionButton>
          </span>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip title="Settings">
          <span>
            <ActionButton
              variant="icon"
              size="medium"
              ariaLabel="Open settings"
              onClick={onSettingsClick}
              sx={{
                borderRadius: '8px',
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.secondary,
                '&:hover': {
                  color: (theme) => theme.palette.text.primary,
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
            </ActionButton>
          </span>
        </Tooltip>

        {/* User Profile Avatar (Black AK avatar on branch view matching Figma) */}
        <Box
          component="button"
          type="button"
          aria-label="Open profile menu"
          aria-haspopup="menu"
          aria-expanded={profileAnchor ? true : undefined}
          onClick={(event) => setProfileAnchor(event.currentTarget)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: isBranchView ? 0 : '2px',
            borderRadius: '50%',
            border: isBranchView ? 'none' : `2px solid ${colors.primary.default}`,
            bgcolor: 'transparent',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 0 10px ${colors.sidebar.activeGlow}`,
            },
          }}
        >
          <Avatar
            src={activeUser?.avatar}
            alt={activeUser?.name || 'User'}
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isBranchView ? '#111827' : colors.surface.muted,
              color: isBranchView ? '#FFFFFF' : colors.primary.default,
            }}
          >
            {initials(activeUser?.name)}
          </Avatar>
        </Box>
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={closeProfileMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            list: { dense: true, sx: { py: 0.5 } },
            paper: {
              sx: {
                width: 240,
                mt: 1,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                overflow: 'hidden',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1.75, py: 1.5 }}>
            <Avatar
              src={activeUser?.avatar}
              alt={displayName}
              sx={{
                width: 40,
                height: 40,
                fontSize: '0.9375rem',
                fontWeight: 700,
                bgcolor: '#111827',
                color: '#FFFFFF',
              }}
            >
              {initials(displayName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 400,
                  color: 'text.secondary',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayRole}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'divider' }} />

          {PROFILE_MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => handleProfileMenuAction(item.id)}
              sx={{
                mx: 0.5,
                my: 0.25,
                px: 1.25,
                py: 1,
                borderRadius: '8px',
                gap: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'text.primary' }}>{item.icon}</ListItemIcon>
              <ListItemText>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  {item.label}
                </Typography>
              </ListItemText>
            </MenuItem>
          ))}

          <Divider sx={{ borderColor: 'divider', my: 0.5 }} />

          <MenuItem
            onClick={() => handleProfileMenuAction('logout')}
            sx={{
              mx: 0.5,
              mb: 0.5,
              px: 1.25,
              py: 1,
              borderRadius: '8px',
              gap: 0.5,
              color: colors.danger.default,
              '&:hover': {
                bgcolor: 'action.hover',
                color: colors.danger.default,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
              <LogOut size={18} strokeWidth={1.75} />
            </ListItemIcon>
            <ListItemText>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'inherit' }}>
                Logout
              </Typography>
            </ListItemText>
          </MenuItem>
        </Menu>
        <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
      </Stack>
    </Box>
  );
}

function initials(name?: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatRoleLabel(role?: string): string {
  const value = (role ?? '').trim();
  if (!value) return 'User';
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

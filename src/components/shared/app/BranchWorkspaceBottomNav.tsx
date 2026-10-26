'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

import { resolveSidebarRoute, type SidebarContext, type SidebarUserProfile } from '@/app/sidebar';
import { homePathForRole } from '@/lib/auth/session';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  isActive: (pathname: string) => boolean;
};

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function buildNavItems(role: string, context: SidebarContext): NavItem[] {
  const dashboardHref = role ? homePathForRole(role) : '/branch-manager/dashboard';
  const staffHref = resolveSidebarRoute('/branch-manager/employees/users-and-roles', context, role);
  const financeHref = resolveSidebarRoute('/branch-manager/management/due-payments', context, role);
  const reportsHref = resolveSidebarRoute('/branch-manager/management/reports', context, role);
  const profileHref = resolveSidebarRoute(
    '/branch-manager/employees/users-and-roles/profile',
    context,
    role,
  );

  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: dashboardHref,
      icon: <DashboardOutlinedIcon sx={{ fontSize: 22 }} />,
      isActive: (pathname) => {
        if (pathname.includes('pos/point-of-sale/dashboard')) return false;
        return pathname.endsWith('/dashboard') || pathname.includes('/dashboard/');
      },
    },
    {
      id: 'staff',
      label: 'Staff',
      href: staffHref,
      icon: <GroupOutlinedIcon sx={{ fontSize: 22 }} />,
      isActive: (pathname) =>
        pathname.includes('users-and-roles') && !pathname.includes('/profile'),
    },
    {
      id: 'finance',
      label: 'Finance',
      href: financeHref,
      icon: <CreditCardOutlinedIcon sx={{ fontSize: 22 }} />,
      isActive: (pathname) =>
        pathname.includes('due-payments') ||
        pathname.includes('cash-shift') ||
        pathname.includes('cash-counter'),
    },
    {
      id: 'reports',
      label: 'Reports',
      href: reportsHref,
      icon: <BarChartOutlinedIcon sx={{ fontSize: 22 }} />,
      isActive: (pathname) => pathname.includes('/reports'),
    },
    {
      id: 'profile',
      label: 'Profile',
      href: profileHref,
      icon: null,
      isActive: (pathname) => pathname.includes('/profile'),
    },
  ];
}

/** Branch-manager mobile workspace tabs (dashboard, staff, finance, reports, profile). */
export function BranchWorkspaceBottomNav({
  role = '',
  context = {},
  user,
}: Readonly<{
  role?: string;
  context?: SidebarContext;
  user?: SidebarUserProfile;
}>) {
  const pathname = usePathname() ?? '';
  const items = buildNavItems(role, context);
  const initials = userInitials(user?.name ?? 'User');

  return (
    <Box
      component="nav"
      aria-label="Workspace"
      sx={{
        display: { [screen.mobile]: 'flex', [screen.desktop]: 'none' },
        flexShrink: 0,
        alignItems: 'stretch',
        justifyContent: 'space-around',
        gap: 0.5,
        px: 1,
        pt: 0.75,
        pb: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 25,
      }}
    >
      {items.map((item) => {
        const active = item.isActive(pathname);
        const color = active ? 'primary.main' : 'text.secondary';

        return (
          <Box
            key={item.id}
            component={Link}
            href={item.href}
            sx={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.35,
              py: 0.5,
              px: 0.25,
              textDecoration: 'none',
              color,
              borderRadius: 1,
              transition: 'color 0.15s ease',
              '&:hover': { color: active ? 'primary.main' : 'text.primary' },
            }}
          >
            {item.id === 'profile' ? (
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: active ? 'primary.main' : colors.black.light,
                  color: 'common.white',
                }}
              >
                {initials}
              </Avatar>
            ) : (
              <Box sx={{ display: 'inline-flex', color }}>{item.icon}</Box>
            )}
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: active ? 700 : 500,
                lineHeight: 1.2,
                color: 'inherit',
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

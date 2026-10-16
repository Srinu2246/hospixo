'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Typography, Avatar, ButtonBase } from '@mui/material';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';

import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';
import { useIsApplication } from '@/lib/hooks/useIsApplication';
import type { SidebarUserProfile } from '@/app/sidebar';

export interface BottomNavbarProps {
  user?: SidebarUserProfile;
  onProfileClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function BottomNavbar({ user, onProfileClick }: Readonly<BottomNavbarProps>) {
  const isApp = useIsApplication();
  const pathname = usePathname() || '';
  const router = useRouter();

  if (!isApp) return null;

  const isDashboard = pathname.includes('/dashboard') || pathname === '/';
  const isStaff = pathname.includes('/employees') || pathname.includes('/staff');
  const isFinance =
    pathname.includes('/due-payments') ||
    pathname.includes('/finance') ||
    pathname.includes('/settle');
  const isReports = pathname.includes('/reports');

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <GridViewOutlinedIcon sx={{ fontSize: 22 }} />,
      active: isDashboard,
      href: '/branch-manager/dashboard',
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: <PeopleOutlinedIcon sx={{ fontSize: 22 }} />,
      active: isStaff,
      href: '/employees/user-roles',
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: <CreditCardOutlinedIcon sx={{ fontSize: 22 }} />,
      active: isFinance,
      href: '/pos/point-of-sale/due-payments',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChartOutlinedIcon sx={{ fontSize: 22 }} />,
      active: isReports,
      href: '/reports',
    },
  ];

  const handleNav = (href: string) => {
    if (href && href !== pathname) {
      router.push(href);
    }
  };

  return (
    <Box
      component="nav"
      aria-label="Bottom navigation"
      sx={{
        display: { [screen.mobile]: 'flex', [screen.tablet]: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        bgcolor: (theme) => theme.palette.background.paper,
        borderTop: '1px solid',
        borderColor: (theme) => theme.palette.divider,
        alignItems: 'center',
        justifyContent: 'space-around',
        px: 1,
        zIndex: 1100,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 -4px 16px rgba(0,0,0,0.4)'
            : '0 -2px 10px rgba(0,0,0,0.04)',
      }}
    >
      {navItems.map((item) => {
        const activeColor = colors.primary.default;
        const inactiveColor = colors.text.secondary;
        const color = item.active ? activeColor : inactiveColor;

        return (
          <ButtonBase
            key={item.id}
            onClick={() => handleNav(item.href)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.25,
              py: 0.5,
              px: 1.5,
              borderRadius: '8px',
              minWidth: 56,
              color,
              transition: 'color 0.15s ease',
              '&:hover': {
                color: activeColor,
              },
            }}
          >
            {React.cloneElement(item.icon, { sx: { fontSize: 22, color: 'inherit' } })}
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: item.active ? 700 : 500,
                color: 'inherit',
                lineHeight: 1.1,
              }}
            >
              {item.label}
            </Typography>
          </ButtonBase>
        );
      })}

      {/* Profile Tab */}
      <ButtonBase
        onClick={(e) => onProfileClick?.(e)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          py: 0.5,
          px: 1.5,
          borderRadius: '8px',
          minWidth: 56,
          color: colors.text.secondary,
          transition: 'color 0.15s ease',
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        <Avatar
          sx={{
            width: 22,
            height: 22,
            fontSize: '0.625rem',
            fontWeight: 800,
            bgcolor: '#111827',
            color: '#FFFFFF',
          }}
        >
          {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AK'}
        </Avatar>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: 'inherit',
            lineHeight: 1.1,
          }}
        >
          Profile
        </Typography>
      </ButtonBase>
    </Box>
  );
}

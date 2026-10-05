'use client';

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import type {
  WorkspaceNavGroup as WorkspaceNavGroupType,
  WorkspaceNavItem,
} from '@/lib/constants/workspaceNavigation';
import { colors } from '@/lib/theme/mui/colors';

function isNavItemActive(pathname: string, href: string, homeHref: string) {
  if (pathname === href) return true;
  if (href === homeHref) return pathname === homeHref;
  return pathname.startsWith(`${href}/`);
}

function groupHasActiveItem(pathname: string, group: WorkspaceNavGroupType, homeHref: string) {
  return group.items.some((item) => isNavItemActive(pathname, item.href, homeHref));
}

function NavLink({
  item,
  pathname,
  homeHref,
  collapsed,
  onNavigate,
}: Readonly<{
  item: WorkspaceNavItem;
  pathname: string;
  homeHref: string;
  collapsed: boolean;
  onNavigate?: () => void;
}>) {
  const active = isNavItemActive(pathname, item.href, homeHref);
  const Icon = item.Icon;

  return (
    <ListItemButton
      component={Link}
      href={item.href}
      onClick={onNavigate}
      sx={{
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? 0 : 1.5,
        minHeight: '2.35rem',
        mx: collapsed ? 'auto' : 0,
        width: collapsed ? '2.5rem' : 'auto',
        px: collapsed ? 0 : 1.5,
        borderRadius: 0.65,
        color: '#CBD5E1',
        fontSize: '0.9rem',
        fontWeight: 500,
        border: '1px solid transparent',
        '&:hover': {
          bgcolor: colors.workspace.sidebar.hoverBg,
          color: colors.workspace.sidebar.foreground,
        },
        ...(active && {
          bgcolor: colors.workspace.sidebar.activeBg,
          color: '#FFFFFF',
          '&:hover': {
            bgcolor: colors.workspace.sidebar.activeBg,
            color: '#FFFFFF',
          },
        }),
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 28,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: '1.05rem' }} />
      </ListItemIcon>
      {!collapsed ? (
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx: {
                fontSize: '0.9rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
            },
          }}
        />
      ) : null}
    </ListItemButton>
  );
}

type WorkspaceNavGroupProps = Readonly<{
  group: WorkspaceNavGroupType;
  pathname: string;
  homeHref: string;
  collapsed: boolean;
  onNavigate?: () => void;
}>;

export function WorkspaceNavGroup({
  group,
  pathname,
  homeHref,
  collapsed,
  onNavigate,
}: WorkspaceNavGroupProps) {
  const hasActive = groupHasActiveItem(pathname, group, homeHref);
  const [open, setOpen] = useState((group.defaultOpen ?? true) || hasActive);

  const isOpen = useMemo(() => {
    if (collapsed || !group.collapsible) return true;
    return open || hasActive;
  }, [collapsed, group.collapsible, open, hasActive]);

  return (
    <Box sx={{ mt: group.id === 'home' ? 0 : 1.5 }}>
      {group.label && !collapsed ? (
        group.collapsible ? (
          <Box
            component="button"
            type="button"
            onClick={() => setOpen((current) => !current)}
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              py: 0.5,
              px: 1.25,
              mb: 0.5,
              border: 0,
              bgcolor: 'transparent',
              color: colors.workspace.sidebar.foregroundMuted,
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {group.label}
            </Typography>
            <ExpandMoreOutlinedIcon
              sx={{
                fontSize: '0.85rem',
                transform: isOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 140ms ease',
              }}
            />
          </Box>
        ) : (
          <Typography
            sx={{
              px: 1.25,
              mb: 0.5,
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.workspace.sidebar.foregroundMuted,
            }}
          >
            {group.label}
          </Typography>
        )
      ) : null}

      <Collapse in={isOpen}>
        <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {group.items.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              pathname={pathname}
              homeHref={homeHref}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  );
}

'use client';

import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Avatar, Box, Drawer, IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BrandLogo } from '@/components/common/BrandLogo';
import { WorkspaceNavGroup } from '@/components/layout/workspace/WorkspaceNavGroup';
import { workspaceSidebarConfig, workspaceUserProfile } from '@/lib/constants/workspaceNavigation';
import { colors } from '@/lib/theme/mui/colors';

type WorkspaceSidebarProps = Readonly<{
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}>;

function SidebarPanel({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showClose,
  onClose,
}: Readonly<{
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
}>) {
  const pathname = usePathname() ?? '';
  const config = workspaceSidebarConfig;
  const profile = workspaceUserProfile;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: colors.workspace.sidebar.bg,
        color: colors.workspace.sidebar.foreground,
        borderRight: `1px solid ${colors.workspace.sidebar.border}`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          height: '3.75rem',
          px: collapsed ? 1 : 1.5,
          borderBottom: `1px solid ${colors.workspace.sidebar.border}`,
        }}
      >
        {!collapsed ? (
          <BrandLogo tone="light" href={config.homeHref} />
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              mx: 'auto',
              borderRadius: 1,
              background: `linear-gradient(135deg, ${colors.auth.accent}, ${colors.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: colors.auth.accentForeground,
            }}
          >
            H
          </Box>
        )}

        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          {showClose && onClose ? (
            <IconButton onClick={onClose} aria-label="Close navigation" sx={{ color: 'inherit' }}>
              <CloseOutlinedIcon />
            </IconButton>
          ) : null}
          {onToggleCollapse ? (
            <IconButton
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                ...(collapsed && {
                  position: 'absolute',
                  right: -10,
                  top: 14,
                }),
                width: 26,
                height: 26,
                bgcolor: '#1A1F2B',
                border: '1px solid rgb(255 255 255 / 0.12)',
                color: '#E5E7EB',
                '&:hover': { bgcolor: '#242B3A' },
              }}
            >
              {collapsed ? (
                <ChevronRightOutlinedIcon sx={{ fontSize: '0.9rem' }} />
              ) : (
                <ChevronLeftOutlinedIcon sx={{ fontSize: '0.9rem' }} />
              )}
            </IconButton>
          ) : null}
        </Box>
      </Box>

      <Box
        component="nav"
        aria-label={config.navAriaLabel}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          py: 0.5,
          px: collapsed ? 0.5 : 1.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {config.groups.map((group) => (
          <WorkspaceNavGroup
            key={group.id}
            group={group}
            pathname={pathname}
            homeHref={config.homeHref}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${colors.workspace.sidebar.border}`,
          p: 1.5,
        }}
      >
        <Box
          component={Link}
          href={config.homeHref}
          onClick={onNavigate}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minHeight: '2.35rem',
            px: 1.25,
            py: 0.75,
            borderRadius: 0.7,
            textDecoration: 'none',
            color: '#E2E8F0',
            '&:hover': { bgcolor: colors.workspace.sidebar.hoverBg },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.8rem',
              fontWeight: 700,
              bgcolor: colors.workspace.sidebar.hoverBg,
              color: colors.workspace.sidebar.foreground,
            }}
          >
            {profile.initials}
          </Avatar>
          {!collapsed ? (
            <>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profile.displayName}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    color: colors.workspace.sidebar.foregroundMuted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profile.roleLabel}
                </Typography>
              </Box>
              <PersonOutlineOutlinedIcon sx={{ fontSize: '1.05rem', color: '#94A3B8' }} />
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export function WorkspaceSidebar({ mobileOpen = false, onMobileClose }: WorkspaceSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: '15.5rem',
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        <SidebarPanel
          showClose
          onClose={onMobileClose}
          onNavigate={onMobileClose}
          collapsed={false}
        />
      </Drawer>

      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexShrink: 0,
          width: collapsed ? '4.75rem' : '15.5rem',
          transition: 'width 160ms ease',
        }}
      >
        <Box sx={{ position: 'sticky', top: 0, height: '100svh', width: '100%' }}>
          <SidebarPanel
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((current) => !current)}
          />
        </Box>
      </Box>
    </>
  );
}

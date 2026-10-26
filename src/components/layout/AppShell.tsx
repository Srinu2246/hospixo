'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from '@/components/shared/app/Sidebar';
import { TopNavbar } from '@/components/shared/app/TopNavbar';
import { WorkspaceBottomNav } from '@/components/shared/app/WorkspaceBottomNav';
import { Toast } from '@/components/shared/ui/Toast';
import { isSidebarlessRole } from '@/app/sidebar';
import { isPublicAuthPath } from '@/lib/auth/publicAuthRoutes';
import type { SidebarSession } from '@/lib/auth/session';
import {
  captainMainUsesStickyFooter,
  isCaptainListScreenPath,
  isCaptainOrderSettlePath,
  isCaptainWorkspacePath,
  POS_CAPTAIN_BOTTOM_NAV_HEIGHT,
  POS_CAPTAIN_COMPACT_PADDING,
  POS_CAPTAIN_LIST_BOTTOM_GAP,
  POS_CAPTAIN_STICKY_FOOTER_HEIGHT,
} from '@/lib/helpers/posCaptainFlow';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useToastStore } from '@/stores/toastStore';

type AppShellProps = {
  children: React.ReactNode;
  initialSession?: SidebarSession | null;
};

export function AppShell({ children, initialSession = null }: AppShellProps) {
  const pathname = usePathname() ?? '';
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setIsOpen = useSidebarStore((state) => state.setIsOpen);
  const storeRole = useSidebarStore((state) => state.role);
  const storeContext = useSidebarStore((state) => state.context);
  const storeUser = useSidebarStore((state) => state.user);
  const setSession = useSidebarStore((state) => state.setSession);
  const hydrateSession = useSidebarStore((state) => state.hydrateSession);
  const toastMessage = useToastStore((state) => state.message);
  const toastSeverity = useToastStore((state) => state.severity);
  const clearToast = useToastStore((state) => state.clear);
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down(screen.desktop), { noSsr: true });
  const captainPath = isCaptainWorkspacePath(pathname);
  const captainListPath = isCaptainListScreenPath(pathname);
  const captainOrderSettlePath = isCaptainOrderSettlePath(pathname);
  const captainStickyFooter = captainMainUsesStickyFooter(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navPathname, setNavPathname] = useState(pathname);
  if (pathname !== navPathname) {
    setNavPathname(pathname);
    setMobileOpen(false);
  }

  const role = storeRole || initialSession?.role || '';
  const context = storeRole ? storeContext : (initialSession?.context ?? {});
  const user = storeRole ? storeUser : (initialSession?.user ?? storeUser);

  useEffect(() => {
    if (storeRole) return;
    if (initialSession) {
      setSession(initialSession);
      return;
    }
    hydrateSession();
  }, [hydrateSession, initialSession, setSession, storeRole]);

  const toast = (
    <Toast
      open={Boolean(toastMessage)}
      message={toastMessage ?? ''}
      severity={toastSeverity}
      onClose={clearToast}
    />
  );

  if (isPublicAuthPath(pathname)) {
    return (
      <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: 'background.default' }}>
        {children}
        {toast}
      </Box>
    );
  }

  // Chef station: full-screen KDS with no sidebar / top navbar chrome.
  if (isSidebarlessRole(role)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {children}
        {toast}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* 
        Fixed Left Sidebar:
        - Stationary on the left side
        - Width comes from Sidebar (320 open / 76 collapsed) for all roles
        - Does NOT scroll when page content scrolls
      */}
      <Box
        sx={{
          display: captainPath
            ? {
                [screen.mobile]: mobileOpen ? 'block' : 'none',
                [screen.tablet]: mobileOpen ? 'block' : 'none',
                [screen.desktop]: 'contents',
              }
            : { [screen.mobile]: 'block', [screen.desktop]: 'contents' },
          width: { [screen.mobile]: 0, [screen.desktop]: 'unset' },
          flexShrink: 0,
          '& > aside': {
            position: { [screen.mobile]: 'fixed', [screen.desktop]: 'sticky' },
            top: { [screen.mobile]: 0 },
            left: { [screen.mobile]: 'auto', [screen.desktop]: 0 },
            right: { [screen.mobile]: 0, [screen.desktop]: 'auto' },
            zIndex: { [screen.mobile]: 1300 },
            // Do not set width here — `& > aside { width: unset }` beats Sidebar’s
            // own width class by specificity and pins the rail to content size.
            // Sidebar owns open/collapsed width (320 / 76) for every role.
            boxShadow: {
              [screen.mobile]: mobileOpen ? '-4px 0 24px rgba(0, 0, 0, 0.35)' : 'none',
              [screen.desktop]: 'none',
            },
            transform: {
              [screen.mobile]: mobileOpen ? 'none' : 'translateX(100%)',
              [screen.desktop]: 'none',
            },
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        <Sidebar
          isOpen={compact ? true : isOpen}
          onToggle={(open) => {
            if (compact) setMobileOpen(open);
            else setIsOpen(open);
          }}
          forcePrimaryNavigation={captainPath && compact && mobileOpen}
          onRequestClose={compact ? () => setMobileOpen(false) : undefined}
          role={role}
          context={context}
          user={user}
        />
      </Box>
      {mobileOpen ? (
        <Box
          component="button"
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          sx={{
            display: { [screen.mobile]: 'block', [screen.desktop]: 'none' },
            position: 'fixed',
            inset: 0,
            zIndex: 1290,
            border: 0,
            p: 0,
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            cursor: 'pointer',
          }}
        />
      ) : null}

      {/* 
        Right Column:
        - Stationary TopNavbar at the top
        - Independently scrollable main content below
      */}
      <Box
        sx={{
          flex: 1,
          height: '100vh',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: (theme) =>
            captainPath
              ? {
                  xs: colors.captainFlow.pageBackground,
                  sm: colors.captainFlow.pageBackground,
                  md: theme.palette.background.default,
                }
              : theme.palette.background.default,
        }}
      >
        <TopNavbar
          role={role}
          context={context}
          user={user}
          onOpenMenu={() => setMobileOpen(true)}
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            component="main"
            id="app-main-content"
            sx={{
              flex: captainPath ? { [screen.mobile]: '0 1 auto', [screen.desktop]: 1 } : 1,
              maxHeight: captainPath
                ? {
                    [screen.mobile]: captainStickyFooter
                      ? `calc(100vh - 56px - ${POS_CAPTAIN_BOTTOM_NAV_HEIGHT}px - ${POS_CAPTAIN_STICKY_FOOTER_HEIGHT}px)`
                      : `calc(100vh - 56px - ${POS_CAPTAIN_BOTTOM_NAV_HEIGHT}px)`,
                    [screen.desktop]: 'none',
                  }
                : undefined,
              minHeight: 0,
              minWidth: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: (theme) =>
                captainPath
                  ? {
                      xs: colors.captainFlow.pageBackground,
                      sm: colors.captainFlow.pageBackground,
                      md: theme.palette.background.default,
                    }
                  : theme.palette.background.default,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              p: captainPath
                ? {
                    [screen.mobile]: POS_CAPTAIN_COMPACT_PADDING,
                    [screen.tablet]: POS_CAPTAIN_COMPACT_PADDING,
                    [screen.desktop]: 3,
                  }
                : { [screen.mobile]: 2, [screen.desktop]: 3 },
              pb: captainPath
                ? {
                    [screen.mobile]:
                      captainListPath || captainOrderSettlePath
                        ? `${POS_CAPTAIN_LIST_BOTTOM_GAP}px`
                        : POS_CAPTAIN_COMPACT_PADDING,
                    [screen.tablet]:
                      captainListPath || captainOrderSettlePath
                        ? `${POS_CAPTAIN_LIST_BOTTOM_GAP}px`
                        : POS_CAPTAIN_COMPACT_PADDING,
                    [screen.desktop]: 3,
                  }
                : undefined,
              boxSizing: 'border-box',
            }}
          >
            {children}
          </Box>

          <Box
            id="app-shell-footer"
            sx={{
              flexShrink: 0,
              zIndex: 30,
              bgcolor: 'background.paper',
              borderTop: captainPath
                ? { [screen.mobile]: '1px solid', [screen.desktop]: 'none' }
                : 'none',
              borderColor: 'divider',
              mt: captainPath
                ? {
                    [screen.mobile]: captainStickyFooter ? 'auto' : 0,
                    [screen.desktop]: 0,
                  }
                : 0,
            }}
          />
        </Box>

        <Box
          sx={{
            display: captainPath ? { [screen.mobile]: 'block', [screen.desktop]: 'none' } : 'none',
            flexShrink: 0,
            zIndex: 40,
            position: 'relative',
          }}
        >
          <WorkspaceBottomNav />
        </Box>
      </Box>
      {toast}
    </Box>
  );
}

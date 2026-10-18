'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from '@/components/shared/app/Sidebar';
import { TopNavbar } from '@/components/shared/app/TopNavbar';
import { Toast } from '@/components/shared/ui/Toast';
import { isSidebarlessRole } from '@/app/sidebar';
import type { SidebarSession } from '@/lib/auth/session';
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
  const compact = useMediaQuery(theme.breakpoints.down(screen.tablet), { noSsr: true });
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

  if (pathname === '/login' || pathname.startsWith('/login/')) {
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
        - Width: 248px (Open) / 76px (Closed)
        - Does NOT scroll when page content scrolls
      */}
      <Box
        sx={{
          display: { [screen.mobile]: 'block', [screen.tablet]: 'contents' },
          width: { [screen.mobile]: 0 },
          flexShrink: 0,
          '& > aside': {
            position: { [screen.mobile]: 'fixed', [screen.tablet]: 'sticky' },
            top: { [screen.mobile]: 0 },
            left: { [screen.mobile]: 0 },
            zIndex: { [screen.mobile]: 1300 },
            // Mobile drawer stays full width; tablet+ lets Sidebar set 248 / 76.
            width: { [screen.mobile]: 248, [screen.tablet]: 'unset' },
            minWidth: { [screen.mobile]: 248, [screen.tablet]: 'unset' },
            maxWidth: { [screen.mobile]: 248, [screen.tablet]: 'unset' },
            transform: {
              [screen.mobile]: mobileOpen ? 'none' : 'translateX(-100%)',
              [screen.tablet]: 'none',
            },
            transition: 'transform 0.25s ease',
          },
        }}
      >
        <Sidebar
          isOpen={compact ? true : isOpen}
          onToggle={compact ? setMobileOpen : setIsOpen}
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
            display: { [screen.mobile]: 'block', [screen.tablet]: 'none' },
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
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        {/* Stationary Top Navbar */}
        <TopNavbar
          role={role}
          context={context}
          user={user}
          onOpenMenu={() => setMobileOpen(true)}
        />

        {/* 
          Independently Scrollable Main Content Area:
          - Fills the remaining viewport height
          - Only this section scrolls
          - Padding: 24px on all sides
        */}
        <Box
          component="main"
          id="app-main-content"
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: (theme) => theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column',
            p: { [screen.mobile]: 2, [screen.desktop]: 3 },
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>

        {/* Page Action Footer Container (Outside <main>) */}
        <Box id="app-shell-footer" sx={{ flexShrink: 0, zIndex: 20 }} />
      </Box>
      {toast}
    </Box>
  );
}

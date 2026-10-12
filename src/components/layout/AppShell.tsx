'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Sidebar } from '@/components/shared/app/Sidebar';
import { TopNavbar } from '@/components/shared/app/TopNavbar';
import { useSidebarStore } from '@/stores/sidebarStore';
import { colors } from '@/lib/theme/mui/colors';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setIsOpen = useSidebarStore((state) => state.setIsOpen);
  const role = useSidebarStore((state) => state.role);
  const context = useSidebarStore((state) => state.context);
  const user = useSidebarStore((state) => state.user);

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
        - Width: 260px (Open) / 80px (Closed)
        - Does NOT scroll when page content scrolls
      */}
      <Sidebar isOpen={isOpen} onToggle={setIsOpen} role={role} context={context} user={user} />

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
        <TopNavbar />

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
            p: '24px',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </Box>

        {/* Page Action Footer Container (Outside <main>) */}
        <Box id="app-shell-footer" sx={{ flexShrink: 0, zIndex: 20 }} />
      </Box>
    </Box>
  );
}

export default AppShell;

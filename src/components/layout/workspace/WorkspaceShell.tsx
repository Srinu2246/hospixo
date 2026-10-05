'use client';

import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore, type ReactNode } from 'react';

import { WorkspaceSidebar } from '@/components/layout/workspace/WorkspaceSidebar';
import { WorkspaceTopbar } from '@/components/layout/workspace/WorkspaceTopbar';
import { useWorkspaceMobileNav } from '@/hooks/useWorkspaceMobileNav';
import { AUTH_ROUTES } from '@/lib/constants/routes';
import { colors } from '@/lib/theme/mui/colors';
import { api } from '@/services/api/api';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getTokenSnapshot(): string | null {
  return api.getToken();
}

function getServerTokenSnapshot(): string | null {
  return null;
}

type WorkspaceShellProps = Readonly<{
  children: ReactNode;
}>;

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getTokenSnapshot, getServerTokenSnapshot);
  const { open: navOpen, toggleNav, closeNav } = useWorkspaceMobileNav();

  useEffect(() => {
    if (!token) {
      router.replace(AUTH_ROUTES.login);
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100svh',
        width: '100%',
        overflow: 'hidden',
        bgcolor: colors.workspace.canvas,
      }}
    >
      <WorkspaceSidebar mobileOpen={navOpen} onMobileClose={closeNav} />

      <Box
        sx={{
          display: 'flex',
          minWidth: 0,
          flex: 1,
          flexDirection: 'column',
        }}
      >
        <WorkspaceTopbar navOpen={navOpen} onMenuClick={toggleNav} mode="organisation" />
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

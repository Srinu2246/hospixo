'use client';

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton } from '@mui/material';
import { useTheme } from '@/providers/app-theme-provider';

import { useClientMounted } from '@/hooks/use-client-mounted';

import layoutStyles from '@/features/auth/components/login-split-layout.module.css';

export function AuthThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useClientMounted();

  const isDark = resolvedTheme === 'dark';
  const label = mounted
    ? isDark
      ? 'Switch to light mode'
      : 'Switch to dark mode'
    : 'Toggle color theme';

  return (
    <div className={layoutStyles['login-split__theme-toggle']}>
      <IconButton
        size="small"
        aria-label={label}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        sx={{ color: 'var(--foreground)' }}
      >
        {mounted ? (
          isDark ? (
            <LightModeOutlinedIcon fontSize="small" />
          ) : (
            <DarkModeOutlinedIcon fontSize="small" />
          )
        ) : (
          <span style={{ width: 20, height: 20 }} />
        )}
      </IconButton>
    </div>
  );
}

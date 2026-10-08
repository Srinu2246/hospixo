'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/providers/app-theme-provider';

import { useClientMounted } from '@/hooks/use-client-mounted';
import { cn } from '@/lib/utils';

type WorkspaceThemeToggleProps = Readonly<{
  className?: string;
}>;

export function WorkspaceThemeToggle({ className }: WorkspaceThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useClientMounted();

  const isDark = resolvedTheme === 'dark';
  const ariaLabel = mounted
    ? isDark
      ? 'Switch to light mode'
      : 'Switch to dark mode'
    : 'Toggle color theme';

  return (
    <button
      type="button"
      className={cn(className)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={ariaLabel}
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="size-4" aria-hidden />
        ) : (
          <MoonIcon className="size-4" aria-hidden />
        )
      ) : (
        <span className="size-4" aria-hidden />
      )}
    </button>
  );
}

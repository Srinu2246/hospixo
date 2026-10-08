'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

export type ThemeSetting = 'light' | 'dark' | 'system';

type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function readSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function readStoredTheme(): ThemeSetting {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* ignore */
  }
  return 'system';
}

const themeChangeListeners = new Set<() => void>();

function subscribeThemeSetting(onStoreChange: () => void) {
  themeChangeListeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    themeChangeListeners.delete(onStoreChange);
    window.removeEventListener('storage', onStorage);
  };
}

function notifyThemeSettingChange() {
  themeChangeListeners.forEach((listener) => listener());
}

function subscribeSystemTheme(onStoreChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

export type AppThemeContextValue = Readonly<{
  theme?: string;
  resolvedTheme?: ResolvedTheme;
  setTheme: Dispatch<SetStateAction<string>>;
  themes: readonly string[];
  systemTheme?: ResolvedTheme;
}>;

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const defaultContext: AppThemeContextValue = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  themes: ['light', 'dark', 'system'],
  systemTheme: 'light',
};

export function useTheme(): AppThemeContextValue {
  return useContext(AppThemeContext) ?? defaultContext;
}

/** Class-based light/dark without embedding a React `<script>` (React 19 safe). */
export function AppThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const theme = useSyncExternalStore(
    subscribeThemeSetting,
    readStoredTheme,
    (): ThemeSetting => 'system',
  );
  const systemTheme = useSyncExternalStore(
    subscribeSystemTheme,
    readSystemTheme,
    (): ResolvedTheme => 'light',
  );

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback<Dispatch<SetStateAction<string>>>((value) => {
    const current = readStoredTheme();
    const next =
      typeof value === 'function' ? (value(current) as ThemeSetting) : (value as ThemeSetting);
    const normalized: ThemeSetting =
      next === 'dark' || next === 'light' || next === 'system' ? next : current;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch {
      /* ignore */
    }
    notifyThemeSettingChange();
  }, []);

  const value = useMemo(
    (): AppThemeContextValue => ({
      theme,
      resolvedTheme,
      setTheme,
      themes: ['light', 'dark', 'system'],
      systemTheme,
    }),
    [theme, resolvedTheme, setTheme, systemTheme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

import { type AuthUser, fetchCurrentUser, loginRequest, logoutRequest } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Called from workspace layout after server session validation. */
  syncServerUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Ignore duplicate resume checks from focus + visibilitychange. */
const RESUME_REVALIDATE_MS = 2000;

export function AuthProvider({
  children,
  initialUser = null,
}: Readonly<{
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}>) {
  const pathname = usePathname() ?? '';
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(initialUser == null);
  const pathnameRef = useRef(pathname);
  const isFirstLoad = useRef(true);
  const syncedServerUserRef = useRef<AuthUser | null>(initialUser);
  const userRef = useRef(user);
  const isLoadingRef = useRef(isLoading);
  const requestIdRef = useRef(0);

  useEffect(() => {
    userRef.current = user;
    isLoadingRef.current = isLoading;
  }, [user, isLoading]);

  const syncServerUser = useCallback((serverUser: AuthUser) => {
    syncedServerUserRef.current = serverUser;
    setUser(serverUser);
    setIsLoading(false);
  }, []);

  const loadSession = useCallback(async (options?: { showLoading?: boolean }) => {
    const showLoading = options?.showLoading ?? true;
    const requestId = ++requestIdRef.current;
    if (showLoading) setIsLoading(true);
    try {
      const nextUser = await fetchCurrentUser();
      if (requestId !== requestIdRef.current) return;
      // A resolved response (even null) is an authoritative answer from the
      // server — always trust it. Only a thrown/network failure below falls
      // back to the last confirmed user, to avoid a false logout on a blip.
      syncedServerUserRef.current = nextUser;
      setUser(nextUser);
    } catch {
      if (requestId !== requestIdRef.current) return;
      if (!syncedServerUserRef.current) setUser(null);
    } finally {
      if (requestId === requestIdRef.current && showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const pathnameChanged = pathnameRef.current !== pathname;
    pathnameRef.current = pathname;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      // The server layout already validated the session (authoritative /me)
      // milliseconds ago and AuthSessionSync hydrates that user — a duplicate
      // background /me here only adds a backend round trip to login + first
      // paint, so skip it. Unknown sessions still load blocking.
      if (!syncedServerUserRef.current) {
        void loadSession({ showLoading: true });
      }
      return;
    }

    // Soft-nav after server-action login — retry only while session is unknown.
    // Do not refetch on every pathname change once a user is loaded (POS / Captain
    // sidebar clicks).
    if (pathnameChanged && user === null) {
      void loadSession({ showLoading: true });
    }
  }, [pathname, user, loadSession]);

  const refresh = useCallback(async () => {
    await loadSession({ showLoading: true });
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await loginRequest(email, password);
    syncedServerUserRef.current = nextUser;
    setUser(nextUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    syncedServerUserRef.current = null;
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, refresh, login, logout, syncServerUser }),
    [user, isLoading, refresh, login, logout, syncServerUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

'use client';

import { useLayoutEffect } from 'react';

import { useAuth } from '@/context/auth';
import type { AuthUser } from '@/lib/auth';

/** Hydrates client auth state from the server-validated workspace session. */
export function AuthSessionSync({ user }: Readonly<{ user: AuthUser }>) {
  const { syncServerUser } = useAuth();

  useLayoutEffect(() => {
    syncServerUser(user);
  }, [user, syncServerUser]);

  return null;
}

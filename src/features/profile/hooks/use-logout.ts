'use client';

import { useRouter } from 'next/navigation';

import { routes } from '@/config/routes';
import { useAuth } from '@/context/auth';
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuth();

  async function performLogout() {
    await logout();
    router.replace(routes.auth.login);
  }

  return { performLogout };
}

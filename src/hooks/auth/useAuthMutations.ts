'use client';

import { useMutation } from '@tanstack/react-query';

import { submitAdminLogin, submitAdminLogout } from '@/services/auth';
import { submitPlatformLogin } from '@/services/platform-auth';

export const authMutationKeys = {
  login: ['auth', 'login'] as const,
  platformLogin: ['auth', 'platform-login'] as const,
  logout: ['auth', 'logout'] as const,
};

export function useAdminLoginMutation() {
  return useMutation({
    mutationKey: authMutationKeys.login,
    mutationFn: submitAdminLogin,
  });
}

export function usePlatformLoginMutation() {
  return useMutation({
    mutationKey: authMutationKeys.platformLogin,
    mutationFn: submitPlatformLogin,
  });
}

export function useAdminLogoutMutation() {
  return useMutation({
    mutationKey: authMutationKeys.logout,
    mutationFn: submitAdminLogout,
  });
}

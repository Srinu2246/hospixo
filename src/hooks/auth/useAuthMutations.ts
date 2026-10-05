'use client';

import { useMutation } from '@tanstack/react-query';

import { submitAdminLogin, submitAdminLogout } from '@/services/auth';

export const authMutationKeys = {
  login: ['auth', 'login'] as const,
  logout: ['auth', 'logout'] as const,
};

export function useAdminLoginMutation() {
  return useMutation({
    mutationKey: authMutationKeys.login,
    mutationFn: submitAdminLogin,
  });
}

export function useAdminLogoutMutation() {
  return useMutation({
    mutationKey: authMutationKeys.logout,
    mutationFn: submitAdminLogout,
  });
}

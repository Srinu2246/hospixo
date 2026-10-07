'use client';

import { useMutation } from '@tanstack/react-query';

import { submitAdminLogin, submitAdminLogout, submitLogin } from '@/services/auth';

export const authMutationKeys = {
  login: ['auth', 'login'] as const,
  adminLogin: ['auth', 'admin-login'] as const,
  platformLogin: ['auth', 'login'] as const,
  logout: ['auth', 'logout'] as const,
};

export function useLoginMutation() {
  return useMutation({
    mutationKey: authMutationKeys.login,
    mutationFn: submitLogin,
  });
}

export const usePlatformLoginMutation = useLoginMutation;
export const useClientLoginMutation = useLoginMutation;

export function useAdminLoginMutation() {
  return useMutation({
    mutationKey: authMutationKeys.adminLogin,
    mutationFn: submitAdminLogin,
  });
}

export function useAdminLogoutMutation() {
  return useMutation({
    mutationKey: authMutationKeys.logout,
    mutationFn: submitAdminLogout,
  });
}

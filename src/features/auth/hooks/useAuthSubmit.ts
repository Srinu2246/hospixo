'use client';

import { useRouter } from 'next/navigation';

import { APP_ROUTES, AUTH_ROUTES } from '@/lib/constants/routes';
import { authApi } from '@/services/api/endpoints/authApi';
import { api } from '@/services/api/api';
import { ApiError } from '@/services/api/types';

function persistToken(response: { token?: string; accessToken?: string }) {
  const token = response.token ?? response.accessToken;
  if (token) {
    api.setToken(token);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || 'Unable to complete sign in. Please try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function useAuthSubmit() {
  const router = useRouter();

  return {
    login: async (values: { domain: string; email: string; password: string }) => {
      try {
        const response = await authApi.login(values);
        persistToken(response);
        router.push(APP_ROUTES.dashboard);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    pinLogin: async (values: { branch_id: string; quick_pin: string }) => {
      try {
        const response = await authApi.pinLogin(values);
        persistToken(response);
        router.push(APP_ROUTES.dashboard);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    sendOtp: async (values: { identifier: string }) => {
      try {
        await authApi.sendOtp(values);
        router.push(`${AUTH_ROUTES.otpLogin}?sent=1`);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    forgotPassword: async (values: { email: string }) => {
      try {
        await authApi.forgotPassword(values);
        router.push(`${AUTH_ROUTES.forgotPasswordSent}?email=${encodeURIComponent(values.email)}`);
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
  };
}

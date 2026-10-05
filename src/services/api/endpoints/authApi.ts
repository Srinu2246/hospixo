import { api } from '@/services/api/api';

export type AuthTokenResponse = {
  token?: string;
  accessToken?: string;
};

export const authApi = {
  login: (payload: { domain: string; email: string; password: string }) =>
    api.post<AuthTokenResponse>('/api/auth/login', payload),

  pinLogin: (payload: { branch_id: string; quick_pin: string }) =>
    api.post<AuthTokenResponse>('/api/auth/pin-login', payload),

  sendOtp: (payload: { identifier: string }) => api.post<void>('/api/auth/otp/send', payload),

  forgotPassword: (payload: { email: string }) =>
    api.post<void>('/api/auth/forgot-password', payload),
};

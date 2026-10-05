export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
  values?: { email?: string };
};

export type { TokenUserInfo } from '@/types/platform-auth';

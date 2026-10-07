export type LoginFieldErrors = {
  identifier?: string;
  email?: string;
  password?: string;
  domain?: string;
};

export type LoginState = {
  error?: string;
  fieldErrors?: LoginFieldErrors;
  values?: { identifier?: string; email?: string; domain?: string };
};

export type { TokenUserInfo } from '@/types/platform-auth';

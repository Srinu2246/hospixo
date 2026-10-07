import type { LoginState } from '@/types/auth';

export type LoginSuccessResponse = Readonly<{
  redirectTo: string;
}>;

export type LoginApiResponse = LoginState | LoginSuccessResponse;

export type LoginResult = Readonly<{
  ok: boolean;
  payload: LoginApiResponse | null;
}>;

export type AdminLoginResult = LoginResult;
export type PlatformLoginApiResponse = LoginApiResponse;
export type PlatformLoginResult = LoginResult;
export type ClientLoginApiResponse = LoginApiResponse;
export type ClientLoginResult = LoginResult;

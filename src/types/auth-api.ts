import type { LoginState } from '@/types/auth';

export type LoginSuccessResponse = Readonly<{
  redirectTo: string;
}>;

export type LoginApiResponse = LoginState | LoginSuccessResponse;

export type AdminLoginResult = Readonly<{
  ok: boolean;
  payload: LoginApiResponse | null;
}>;

export type PlatformLoginApiResponse =
  import('@/types/platform-login').PlatformLoginState | LoginSuccessResponse;

export type PlatformLoginResult = Readonly<{
  ok: boolean;
  payload: PlatformLoginApiResponse | null;
}>;

import type { LoginState } from '@/types/auth';

export type LoginSuccessResponse = Readonly<{
  redirectTo: string;
}>;

export type LoginApiResponse = LoginState | LoginSuccessResponse;

export type AdminLoginResult = Readonly<{
  ok: boolean;
  payload: LoginApiResponse | null;
}>;

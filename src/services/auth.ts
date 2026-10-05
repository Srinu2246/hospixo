import { postAdminLoginRequest, postAdminLogoutRequest } from '@/api/auth';
import type { AdminLoginResult, LoginApiResponse, LoginSuccessResponse } from '@/types/auth-api';

export function isLoginSuccessResponse(
  payload: LoginApiResponse | null,
): payload is LoginSuccessResponse {
  return Boolean(payload && 'redirectTo' in payload && payload.redirectTo);
}

/** Client: sign in via auth BFF. */
export async function submitAdminLogin(formData: FormData): Promise<AdminLoginResult> {
  const { ok, payload } = await postAdminLoginRequest(formData);
  return {
    ok,
    payload: payload as LoginApiResponse | null,
  };
}

/** Client: sign out via auth BFF. */
export async function submitAdminLogout(): Promise<LoginSuccessResponse> {
  const response = await postAdminLogoutRequest();

  if (!response.ok) {
    throw new Error(`Logout failed: ${response.statusText}`);
  }

  return response.json() as Promise<LoginSuccessResponse>;
}

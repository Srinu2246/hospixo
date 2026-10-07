import {
  postAdminLoginRequest,
  postAdminLogoutRequest,
  postLoginRequest,
} from '@/services/api/auth';
import type { LoginApiResponse, LoginResult, LoginSuccessResponse } from '@/types/auth-api';

export function isLoginSuccessResponse(
  payload: LoginApiResponse | null,
): payload is LoginSuccessResponse {
  return Boolean(payload && 'redirectTo' in payload && payload.redirectTo);
}

export const isLoginSuccess = isLoginSuccessResponse;

/** Client: sign in via auth BFF (/api/auth/login). */
export async function submitLogin(formData: FormData): Promise<LoginResult> {
  const { ok, payload } = await postLoginRequest(formData);
  return {
    ok,
    payload: payload as LoginApiResponse | null,
  };
}

/** Admin: sign in via auth BFF (/api/auth/admin-login). */
export async function submitAdminLogin(formData: FormData): Promise<LoginResult> {
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

export { submitLogin as submitPlatformLogin, isLoginSuccess as isPlatformLoginSuccess };
export { submitLogin as submitClientLogin, isLoginSuccess as isClientLoginSuccess };

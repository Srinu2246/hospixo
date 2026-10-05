import { postPlatformLoginRequest } from '@/api/auth';
import { isLoginSuccessResponse } from '@/services/auth';
import type { PlatformLoginResult } from '@/types/auth-api';

export async function submitPlatformLogin(formData: FormData): Promise<PlatformLoginResult> {
  const { ok, payload } = await postPlatformLoginRequest(formData);
  return { ok, payload: payload as PlatformLoginResult['payload'] };
}

export function isPlatformLoginSuccess(
  payload: PlatformLoginResult['payload'],
): payload is { redirectTo: string } {
  return isLoginSuccessResponse(payload);
}

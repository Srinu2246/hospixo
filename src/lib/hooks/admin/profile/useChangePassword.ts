'use client';

import { useApiMutation } from '@/lib/hooks/api/useApiMutation';
import type {
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '@/lib/schemas/admin/profile/adminProfileSchema';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';

export function useChangePassword() {
  return useApiMutation<ChangePasswordResponse, ChangePasswordPayload>({
    path: ApiUrlsV1.auth.changePassword,
    method: 'POST',
  });
}

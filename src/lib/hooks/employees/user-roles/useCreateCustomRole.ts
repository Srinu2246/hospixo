'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toCreateRoleBody } from '@/lib/schemas/employees/user-roles/userRolesSchema';
import type {
  CustomTemplateFormValues,
  PermissionCategory,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1, { rolePermissionsPath } from '@/services/api/ApiUrlsV1';

export function useCreateCustomRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      values: CustomTemplateFormValues;
      categories: PermissionCategory[];
    }) => {
      const created = await api.post<unknown>(
        ApiUrlsV1.roles.create,
        toCreateRoleBody(input.values.templateName, input.values.description),
      );
      const roleId =
        typeof created === 'object' && created && 'id' in created
          ? String((created as { id: string | number }).id)
          : null;
      const enabledPermissionIds = input.categories.flatMap((category) =>
        category.permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id),
      );
      if (roleId && enabledPermissionIds.length > 0) {
        await api.put(rolePermissionsPath(roleId), { permission_ids: enabledPermissionIds });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.roles.list] });
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.roles.templates] });
    },
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveCreateUserRequestContext } from '@/lib/helpers/employees/resolveCreateUserRequestContext';
import {
  parseRoleCatalog,
  parseUserRecord,
  readPrimaryUserRoleId,
  readUserId,
  resolveRoleCode,
  toCreateUserBody,
  type CreateUserFormValues,
  type PermissionCategory,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1, { userAssignmentsPath, userRolePermissionsPath } from '@/services/api/ApiUrlsV1';
import type { CreateUserIdHints } from '@/lib/helpers/employees/resolveCreateUserRequestContext';

export function useCreateStaffUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      values: CreateUserFormValues;
      categories: PermissionCategory[];
      ids: CreateUserIdHints;
    }) => {
      const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list);
      const roleCatalog = parseRoleCatalog(rolesPayload);
      const roleCode = resolveRoleCode(input.values.role, roleCatalog);
      const context = await resolveCreateUserRequestContext(
        { company: input.values.company, branch: input.values.branch },
        input.ids,
        (path, params) => api.get<unknown>(path, params),
        roleCatalog,
        roleCode,
      );
      const body = toCreateUserBody(input.values, context);
      const createdPayload = await api.post<unknown>(ApiUrlsV1.users.create, body);
      const userId = parseUserRecord(createdPayload)?.id ?? readUserId(createdPayload);
      if (!userId) return;

      const assignments = await api.get<unknown>(userAssignmentsPath(userId));
      const userRoleId = readPrimaryUserRoleId(assignments);
      const enabledPermissionIds = input.categories.flatMap((category) =>
        category.permissions
          .filter((permission) => permission.enabled)
          .map((permission) => permission.id),
      );
      if (userRoleId && enabledPermissionIds.length > 0) {
        await api.put(userRolePermissionsPath(userId, userRoleId), {
          permission_ids: enabledPermissionIds,
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
    },
  });
}

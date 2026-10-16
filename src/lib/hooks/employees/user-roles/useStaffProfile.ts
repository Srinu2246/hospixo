'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  parseGroupedPermissions,
  parseUserRecord,
  readPrimaryUserRoleId,
  resolveRoleId,
  staffProfileFromUser,
  toAssignRoleBody,
  toReplaceRolesBody,
  toUpdateUserBody,
  toUserStatusBody,
  parseRoleCatalog,
  type PermissionCategory,
  type StaffProfileFormValues,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1, {
  userAssignmentsPath,
  userRolePermissionsPath,
  userRolesPath,
  userStatusPath,
} from '@/services/api/ApiUrlsV1';

export function useStaffProfile(userId: string | null | undefined) {
  const queryClient = useQueryClient();
  const enabled = Boolean(userId);

  const userQuery = useQuery({
    queryKey: ['api', ApiUrlsV1.users.list, userId],
    enabled,
    queryFn: async ({ signal }) =>
      parseUserRecord(await api.get<unknown>(ApiUrlsV1.users.detail(userId!), undefined, signal)),
  });

  const permissionsQuery = useQuery({
    queryKey: ['api', ApiUrlsV1.permissions.grouped],
    queryFn: async ({ signal }) =>
      parseGroupedPermissions(
        await api.get<unknown>(ApiUrlsV1.permissions.grouped, undefined, signal),
      ),
    staleTime: 60_000,
  });

  const profile = userQuery.data ? staffProfileFromUser(userQuery.data) : undefined;

  const saveMutation = useMutation({
    mutationFn: async (input: {
      values: StaffProfileFormValues;
      categories: PermissionCategory[];
    }) => {
      if (!userId) throw new Error('Missing user id');
      await api.put(ApiUrlsV1.users.update(userId), toUpdateUserBody(input.values));
      await api.patch(
        userStatusPath(userId),
        toUserStatusBody(input.values.userStatus ? 'active' : 'disabled'),
      );

      const rolesPayload = await api.get<unknown>(ApiUrlsV1.roles.list);
      const roleId = resolveRoleId(input.values.roleName, parseRoleCatalog(rolesPayload));
      if (roleId) {
        try {
          await api.put(userRolesPath(userId), toReplaceRolesBody([roleId]));
        } catch {
          await api.post(userRolesPath(userId), toAssignRoleBody(roleId));
        }
      }

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
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
      }
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Missing user id');
      await api.patch(userStatusPath(userId), toUserStatusBody('disabled'));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list] });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ['api', ApiUrlsV1.users.list, userId] });
      }
    },
  });

  return {
    profile,
    categories: permissionsQuery.data ?? [],
    isLoading: userQuery.isLoading || permissionsQuery.isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
    saveProfile: saveMutation.mutateAsync,
    deactivate: deactivateMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
  };
}

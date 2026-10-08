'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createModifierGroupClient,
  createModifierOptionClient,
  fetchModifierGroupByIdClient,
  fetchModifierGroupsClient,
  fetchModifierOptionsClient,
  updateModifierGroupClient,
  updateModifierOptionClient,
} from '../api/modifier-groups';
import type {
  CreateModifierGroupInput,
  CreateModifierOptionInput,
  UpdateModifierGroupInput,
  UpdateModifierOptionInput,
} from '../types/modifier-group';
import type {
  ListModifierGroupsApiQuery,
  ModifierGroupId,
  ModifierOptionId,
} from '../types/modifier-group-api';

export const modifierGroupsQueryKey = (query?: ListModifierGroupsApiQuery) =>
  ['modifier-groups', 'list', query ?? {}] as const;

export const modifierGroupDetailQueryKey = (id: ModifierGroupId) =>
  ['modifier-groups', 'detail', id] as const;

export const modifierOptionsQueryKey = (groupId: ModifierGroupId) =>
  ['modifier-groups', groupId, 'options'] as const;

export function useModifierGroupsListQuery(query?: ListModifierGroupsApiQuery) {
  return useQuery({
    queryKey: modifierGroupsQueryKey(query),
    queryFn: () => fetchModifierGroupsClient(query),
  });
}

export function useModifierOptionsQuery(groupId: ModifierGroupId | null) {
  return useQuery({
    queryKey: modifierOptionsQueryKey(groupId ?? ''),
    queryFn: () => fetchModifierOptionsClient(groupId!),
    enabled: Boolean(groupId),
  });
}

export function useCreateModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateModifierGroupInput) => createModifierGroupClient(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
    },
  });
}

export function useUpdateModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: ModifierGroupId;
      input: UpdateModifierGroupInput;
    }) => updateModifierGroupClient(groupId, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });
      await queryClient.invalidateQueries({
        queryKey: modifierGroupDetailQueryKey(variables.groupId),
      });
    },
  });
}

export async function fetchModifierGroupDetail(groupId: ModifierGroupId) {
  return fetchModifierGroupByIdClient(groupId);
}

export function useCreateModifierOptionMutation(groupId: ModifierGroupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateModifierOptionInput) => createModifierOptionClient(groupId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: modifierOptionsQueryKey(groupId) });
    },
  });
}

export function useUpdateModifierOptionMutation(groupId: ModifierGroupId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      optionId,
      input,
    }: {
      optionId: ModifierOptionId;
      input: UpdateModifierOptionInput;
    }) => updateModifierOptionClient(groupId, optionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: modifierOptionsQueryKey(groupId) });
    },
  });
}

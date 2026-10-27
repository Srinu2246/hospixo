'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { mealSessionToSessionRecord } from '@/lib/helpers/mealSessionMapper';
import { useQuery } from '@/lib/hooks/api/useQuery';
import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import {
  parseMealSessionRecord,
  parseMealSessions,
  type CreateMealSessionBody,
  type MealSessionListParams,
  type UpdateMealSessionBody,
} from '@/lib/schemas/menu/sessions/mealSessionsSchema';
import type { SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';
import { api } from '@/services/api/browserClient';
import { branchMealSessionPath, branchMealSessionsPath } from '@/services/api/ApiUrlsV1';

export const mealSessionsQueryRoot = (branchId: number | undefined) =>
  ['branches', branchId, 'meal-sessions'] as const;

export const mealSessionsQueryKey = (
  branchId: number | undefined,
  params?: MealSessionListParams,
) => [...mealSessionsQueryRoot(branchId), params ?? {}] as const;

function mealSessionsListQueryParams(params?: MealSessionListParams) {
  const status = params?.status && params.status !== 'all' ? params.status : undefined;
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 100,
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
    ...(status ? { status } : {}),
    ...(status === 'active' ? { is_active: true } : {}),
    ...(status === 'inactive' ? { is_active: false } : {}),
  };
}

/**
 * Branch meal sessions list.
 * GET /v1/branches/{branch_id}/meal-sessions?search&status&is_active&page&page_size
 */
export function useMealSessions(branchId: number | undefined, params?: MealSessionListParams) {
  return useQuery({
    queryKey: mealSessionsQueryKey(branchId, params),
    enabled: typeof branchId === 'number',
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        branchMealSessionsPath(branchId as number),
        mealSessionsListQueryParams(params),
        signal,
      );
      return parseMealSessions(payload);
    },
  });
}

export function useMenuMealSessions(branchId?: number, params?: MealSessionListParams) {
  const activeBranchId = useActiveBranchId(branchId);
  const query = useMealSessions(activeBranchId, params);

  const sessions: SessionRecord[] = useMemo(
    () => (query.data?.items ?? []).map(mealSessionToSessionRecord),
    [query.data?.items],
  );

  return {
    branchId: activeBranchId,
    sessions,
    total: query.data?.total ?? 0,
    page: query.data?.page ?? params?.page ?? 1,
    pageSize: query.data?.page_size ?? params?.page_size ?? 100,
    ...query,
  };
}

export type CreateMealSessionVariables = {
  branchId: number;
  body: CreateMealSessionBody;
};

/**
 * Create branch meal session.
 * POST /v1/branches/{branch_id}/meal-sessions
 */
export function useCreateMealSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, body }: CreateMealSessionVariables) => {
      const payload = await api.post(branchMealSessionsPath(branchId), body, { silent: true });
      return parseMealSessionRecord(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: mealSessionsQueryRoot(variables.branchId),
      });
    },
  });
}

export type UpdateMealSessionVariables = {
  branchId: number;
  sessionId: number;
  body: UpdateMealSessionBody;
};

/**
 * Update branch meal session.
 * PATCH /v1/branches/{branch_id}/meal-sessions/{session_id}
 */
export function useUpdateMealSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ branchId, sessionId, body }: UpdateMealSessionVariables) => {
      const payload = await api.patch(branchMealSessionPath(branchId, sessionId), body, {
        silent: true,
      });
      return parseMealSessionRecord(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: mealSessionsQueryRoot(variables.branchId),
      });
    },
  });
}

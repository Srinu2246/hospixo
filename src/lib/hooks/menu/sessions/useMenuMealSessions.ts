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
  type UpdateMealSessionBody,
} from '@/lib/schemas/menu/sessions/mealSessionsSchema';
import type { SessionRecord } from '@/lib/schemas/menu/sessions/sessionSchema';
import { api } from '@/services/api/browserClient';
import { branchMealSessionPath, branchMealSessionsPath } from '@/services/api/ApiUrlsV1';

export const mealSessionsQueryKey = (branchId: number | undefined) =>
  ['branches', branchId, 'meal-sessions'] as const;

/**
 * Branch meal sessions list.
 * GET /v1/branches/{branch_id}/meal-sessions
 */
export function useMealSessions(branchId: number | undefined) {
  return useQuery({
    queryKey: mealSessionsQueryKey(branchId),
    enabled: typeof branchId === 'number',
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(branchMealSessionsPath(branchId as number), undefined, signal);
      return parseMealSessions(payload);
    },
  });
}

export function useMenuMealSessions(branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);
  const query = useMealSessions(activeBranchId);

  const sessions: SessionRecord[] = useMemo(
    () => (query.data ?? []).map(mealSessionToSessionRecord),
    [query.data],
  );

  return {
    branchId: activeBranchId,
    sessions,
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
        queryKey: mealSessionsQueryKey(variables.branchId),
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
        queryKey: mealSessionsQueryKey(variables.branchId),
      });
    },
  });
}

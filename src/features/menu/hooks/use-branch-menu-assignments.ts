'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import type { RestaurantMenu } from '../types/restaurant-menu';
import { branchMenuAssignmentsQueryKey } from './restaurant-menus-query-keys';

export type BranchMenuAssignmentRow = Readonly<{
  branchId: number;
  branchName: string;
  assignmentId: number | null;
  menuId: number | null;
  menuName: string | null;
  menuType: string | null;
  status: string | null;
}>;

export type BranchMenuAssignmentsPayload = Readonly<{
  assignments: readonly BranchMenuAssignmentRow[];
  menus: readonly RestaurantMenu[];
}>;

async function fetchBranchMenuAssignments(): Promise<BranchMenuAssignmentsPayload> {
  const res = await clientApi.get<unknown>('/menu/branch-assignments');
  const data = unwrapBffData<BranchMenuAssignmentsPayload>(res);
  return {
    assignments: data?.assignments ?? [],
    menus: data?.menus ?? [],
  };
}

export function useBranchMenuAssignmentsQuery() {
  return useQuery({
    queryKey: branchMenuAssignmentsQueryKey,
    queryFn: fetchBranchMenuAssignments,
  });
}

export function useAssignBranchMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { branchId: number; menuId: number }) => {
      await clientApi.post('/menu/branch-assignments', input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: branchMenuAssignmentsQueryKey });
    },
  });
}

export function useSyncBranchMenuMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { branchId: number; assignmentId: number }) => {
      await clientApi.post(`/menu/branches/${input.branchId}/sync`, {
        assignmentId: input.assignmentId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: branchMenuAssignmentsQueryKey });
    },
  });
}

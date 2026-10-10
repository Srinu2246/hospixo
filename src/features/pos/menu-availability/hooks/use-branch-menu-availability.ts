'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBranchMenuAvailability,
  updateBranchMenuItemAvailability,
  batchUpdateBranchMenuItemAvailability,
  type UpdateMenuItemAvailabilityPayload,
} from '../api/branch-menu-availability-api';

export type BranchAvailabilityScopeId = string | number | null | undefined;

export const branchMenuAvailabilityQueryKey = (branchId: BranchAvailabilityScopeId) =>
  ['branch-menu-availability', String(branchId ?? 'unknown')] as const;

export function useBranchMenuAvailabilityQuery(
  branchId: BranchAvailabilityScopeId,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuAvailabilityQueryKey(branchId),
    queryFn: () => {
      if (branchId == null) throw new Error('Branch id is required');
      return fetchBranchMenuAvailability(branchId);
    },
    enabled: enabled && branchId != null,
  });
}

export function useUpdateBranchMenuItemAvailabilityMutation(branchId: BranchAvailabilityScopeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMenuItemAvailabilityPayload) =>
      updateBranchMenuItemAvailability(payload),
    onSuccess: () => {
      if (branchId != null) {
        queryClient.invalidateQueries({
          queryKey: branchMenuAvailabilityQueryKey(branchId),
        });
        queryClient.invalidateQueries({
          queryKey: ['menu', 'branches'],
        });
        queryClient.invalidateQueries({
          queryKey: ['pos', 'dine-in', 'menu'],
        });
      }
    },
  });
}

export function useBatchUpdateBranchMenuAvailabilityMutation(
  branchId: BranchAvailabilityScopeId,
  assignmentId: BranchAvailabilityScopeId,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ itemOverrideId: string | number; isAvailable: boolean }>) => {
      if (branchId == null || assignmentId == null) {
        throw new Error('Branch ID and Assignment ID are required');
      }
      return batchUpdateBranchMenuItemAvailability(branchId, assignmentId, updates);
    },
    onSuccess: () => {
      if (branchId != null) {
        queryClient.invalidateQueries({
          queryKey: branchMenuAvailabilityQueryKey(branchId),
        });
        queryClient.invalidateQueries({
          queryKey: ['menu', 'branches'],
        });
        queryClient.invalidateQueries({
          queryKey: ['pos', 'dine-in', 'menu'],
        });
      }
    },
  });
}

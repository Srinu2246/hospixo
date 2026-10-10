'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  activateBranchMenuItemClient,
  activateBranchMenuItemModifierClient,
  activateBranchMenuItemVariantClient,
  deactivateBranchMenuItemClient,
  deactivateBranchMenuItemModifierClient,
  deactivateBranchMenuItemVariantClient,
  fetchBranchMenuItemClient,
  fetchBranchMenuItemModifierClient,
  fetchBranchMenuItemModifiersClient,
  fetchBranchMenuItemsClient,
  fetchBranchMenuItemVariantClient,
  fetchBranchMenuItemVariantsClient,
  updateBranchMenuItemClient,
  updateBranchMenuItemModifierClient,
  updateBranchMenuItemVariantClient,
} from '../api/branch-menu-items-client';
import type {
  BranchMenuItemModifierOptionUpdateRequest,
  BranchMenuItemVariantUpdateRequest,
  ListBranchMenuItemModifiersApiQuery,
  ListBranchMenuItemsApiQuery,
  ListBranchMenuItemVariantsApiQuery,
  UpdateBranchMenuItemOverrideApiRequest,
} from '../types/branch-menu-item-api';

export type NullableId = string | number | null | undefined;

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const branchMenuItemsQueryKey = (
  branchId: string | number,
  assignmentId: string | number,
  query?: ListBranchMenuItemsApiQuery,
) =>
  [
    'menu',
    'branches',
    String(branchId),
    'menus',
    String(assignmentId),
    'items',
    query ?? {},
  ] as const;

export const branchMenuItemQueryKey = (
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
) =>
  [
    'menu',
    'branches',
    String(branchId),
    'menus',
    String(assignmentId),
    'items',
    String(itemOverrideId),
  ] as const;

export const branchMenuItemVariantsQueryKey = (
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  query?: ListBranchMenuItemVariantsApiQuery,
) =>
  [
    'menu',
    'branches',
    String(branchId),
    'menus',
    String(assignmentId),
    'items',
    String(itemOverrideId),
    'variants',
    query ?? {},
  ] as const;

export const branchMenuItemVariantQueryKey = (
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
) =>
  [
    'menu',
    'branches',
    String(branchId),
    'menus',
    String(assignmentId),
    'items',
    String(itemOverrideId),
    'variants',
    String(variantOverrideId),
  ] as const;

export const branchMenuItemModifiersQueryKey = (
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  query?: ListBranchMenuItemModifiersApiQuery,
) =>
  [
    'menu',
    'branches',
    String(branchId),
    'menus',
    String(assignmentId),
    'items',
    String(itemOverrideId),
    'modifiers',
    query ?? {},
  ] as const;

export const branchMenuItemModifierQueryKey = (
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
) =>
  [
    'menu',
    'branches',
    String(branchId),
    'menus',
    String(assignmentId),
    'items',
    String(itemOverrideId),
    'modifiers',
    String(modifierOverrideId),
  ] as const;

// -----------------------------------------------------------------------------
// Hooks: Branch Menu Items
// -----------------------------------------------------------------------------

export function useBranchMenuItemsQuery(
  branchId: NullableId,
  assignmentId: NullableId,
  query?: ListBranchMenuItemsApiQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuItemsQueryKey(branchId ?? '', assignmentId ?? '', query),
    queryFn: () => {
      if (!branchId || !assignmentId) throw new Error('branchId and assignmentId are required');
      return fetchBranchMenuItemsClient(branchId, assignmentId, query);
    },
    enabled: Boolean(enabled && branchId && assignmentId),
  });
}

export function useBranchMenuItemQuery(
  branchId: NullableId,
  assignmentId: NullableId,
  itemOverrideId: NullableId,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuItemQueryKey(branchId ?? '', assignmentId ?? '', itemOverrideId ?? ''),
    queryFn: () => {
      if (!branchId || !assignmentId || !itemOverrideId) {
        throw new Error('branchId, assignmentId, and itemOverrideId are required');
      }
      return fetchBranchMenuItemClient(branchId, assignmentId, itemOverrideId);
    },
    enabled: Boolean(enabled && branchId && assignmentId && itemOverrideId),
  });
}

export function useUpdateBranchMenuItemMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBranchMenuItemOverrideApiRequest) =>
      updateBranchMenuItemClient(branchId, assignmentId, itemOverrideId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['menu', 'branches', String(branchId), 'menus', String(assignmentId), 'items'],
      });
    },
  });
}

export function useActivateBranchMenuItemMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activateBranchMenuItemClient(branchId, assignmentId, itemOverrideId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['menu', 'branches', String(branchId), 'menus', String(assignmentId), 'items'],
      });
    },
  });
}

export function useDeactivateBranchMenuItemMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deactivateBranchMenuItemClient(branchId, assignmentId, itemOverrideId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['menu', 'branches', String(branchId), 'menus', String(assignmentId), 'items'],
      });
    },
  });
}

// -----------------------------------------------------------------------------
// Hooks: Branch Menu Item Variants
// -----------------------------------------------------------------------------

export function useBranchMenuItemVariantsQuery(
  branchId: NullableId,
  assignmentId: NullableId,
  itemOverrideId: NullableId,
  query?: ListBranchMenuItemVariantsApiQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuItemVariantsQueryKey(
      branchId ?? '',
      assignmentId ?? '',
      itemOverrideId ?? '',
      query,
    ),
    queryFn: () => {
      if (!branchId || !assignmentId || !itemOverrideId) {
        throw new Error('branchId, assignmentId, and itemOverrideId are required');
      }
      return fetchBranchMenuItemVariantsClient(branchId, assignmentId, itemOverrideId, query);
    },
    enabled: Boolean(enabled && branchId && assignmentId && itemOverrideId),
  });
}

export function useBranchMenuItemVariantQuery(
  branchId: NullableId,
  assignmentId: NullableId,
  itemOverrideId: NullableId,
  variantOverrideId: NullableId,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuItemVariantQueryKey(
      branchId ?? '',
      assignmentId ?? '',
      itemOverrideId ?? '',
      variantOverrideId ?? '',
    ),
    queryFn: () => {
      if (!branchId || !assignmentId || !itemOverrideId || !variantOverrideId) {
        throw new Error(
          'branchId, assignmentId, itemOverrideId, and variantOverrideId are required',
        );
      }
      return fetchBranchMenuItemVariantClient(
        branchId,
        assignmentId,
        itemOverrideId,
        variantOverrideId,
      );
    },
    enabled: Boolean(enabled && branchId && assignmentId && itemOverrideId && variantOverrideId),
  });
}

export function useUpdateBranchMenuItemVariantMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BranchMenuItemVariantUpdateRequest) =>
      updateBranchMenuItemVariantClient(
        branchId,
        assignmentId,
        itemOverrideId,
        variantOverrideId,
        body,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'menu',
          'branches',
          String(branchId),
          'menus',
          String(assignmentId),
          'items',
          String(itemOverrideId),
          'variants',
        ],
      });
    },
  });
}

export function useActivateBranchMenuItemVariantMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      activateBranchMenuItemVariantClient(
        branchId,
        assignmentId,
        itemOverrideId,
        variantOverrideId,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'menu',
          'branches',
          String(branchId),
          'menus',
          String(assignmentId),
          'items',
          String(itemOverrideId),
          'variants',
        ],
      });
    },
  });
}

export function useDeactivateBranchMenuItemVariantMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      deactivateBranchMenuItemVariantClient(
        branchId,
        assignmentId,
        itemOverrideId,
        variantOverrideId,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'menu',
          'branches',
          String(branchId),
          'menus',
          String(assignmentId),
          'items',
          String(itemOverrideId),
          'variants',
        ],
      });
    },
  });
}

// -----------------------------------------------------------------------------
// Hooks: Branch Menu Item Modifiers
// -----------------------------------------------------------------------------

export function useBranchMenuItemModifiersQuery(
  branchId: NullableId,
  assignmentId: NullableId,
  itemOverrideId: NullableId,
  query?: ListBranchMenuItemModifiersApiQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuItemModifiersQueryKey(
      branchId ?? '',
      assignmentId ?? '',
      itemOverrideId ?? '',
      query,
    ),
    queryFn: () => {
      if (!branchId || !assignmentId || !itemOverrideId) {
        throw new Error('branchId, assignmentId, and itemOverrideId are required');
      }
      return fetchBranchMenuItemModifiersClient(branchId, assignmentId, itemOverrideId, query);
    },
    enabled: Boolean(enabled && branchId && assignmentId && itemOverrideId),
  });
}

export function useBranchMenuItemModifierQuery(
  branchId: NullableId,
  assignmentId: NullableId,
  itemOverrideId: NullableId,
  modifierOverrideId: NullableId,
  enabled = true,
) {
  return useQuery({
    queryKey: branchMenuItemModifierQueryKey(
      branchId ?? '',
      assignmentId ?? '',
      itemOverrideId ?? '',
      modifierOverrideId ?? '',
    ),
    queryFn: () => {
      if (!branchId || !assignmentId || !itemOverrideId || !modifierOverrideId) {
        throw new Error(
          'branchId, assignmentId, itemOverrideId, and modifierOverrideId are required',
        );
      }
      return fetchBranchMenuItemModifierClient(
        branchId,
        assignmentId,
        itemOverrideId,
        modifierOverrideId,
      );
    },
    enabled: Boolean(enabled && branchId && assignmentId && itemOverrideId && modifierOverrideId),
  });
}

export function useUpdateBranchMenuItemModifierMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BranchMenuItemModifierOptionUpdateRequest) =>
      updateBranchMenuItemModifierClient(
        branchId,
        assignmentId,
        itemOverrideId,
        modifierOverrideId,
        body,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'menu',
          'branches',
          String(branchId),
          'menus',
          String(assignmentId),
          'items',
          String(itemOverrideId),
          'modifiers',
        ],
      });
    },
  });
}

export function useActivateBranchMenuItemModifierMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      activateBranchMenuItemModifierClient(
        branchId,
        assignmentId,
        itemOverrideId,
        modifierOverrideId,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'menu',
          'branches',
          String(branchId),
          'menus',
          String(assignmentId),
          'items',
          String(itemOverrideId),
          'modifiers',
        ],
      });
    },
  });
}

export function useDeactivateBranchMenuItemModifierMutation(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      deactivateBranchMenuItemModifierClient(
        branchId,
        assignmentId,
        itemOverrideId,
        modifierOverrideId,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'menu',
          'branches',
          String(branchId),
          'menus',
          String(assignmentId),
          'items',
          String(itemOverrideId),
          'modifiers',
        ],
      });
    },
  });
}

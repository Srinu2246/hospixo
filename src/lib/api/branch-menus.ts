import 'server-only';

import {
  mapBranchMenuAssignmentApi,
  mapBranchMenuAssignmentsApi,
  mapBranchMenuTreeApi,
  unwrapBranchMenuAssignmentList,
} from '@/features/menu/api/branch-menus-map';
import type {
  AssignBranchMenuApiRequest,
  BranchMenuAssignmentApi,
  BranchMenuTreeApi,
  BranchMenuTreeApiQuery,
  ListBranchMenusApiQuery,
  UpdateBranchMenuApiRequest,
} from '@/features/menu/types/branch-menu-api';
import type { BranchMenuAssignment, BranchMenuTree } from '@/features/menu/types/branch-menu';
import { apiFetch } from '@/lib/api/http';
import { getServerApiBaseUrl } from '@/lib/api/config';
import {
  unwrapBranchMenuItemModifierList,
  unwrapBranchMenuItemOverrideList,
  unwrapBranchMenuItemVariantList,
} from '@/features/menu/api/branch-menu-item-overrides-map';
import type {
  BranchMenuItemModifierOptionResponse,
  BranchMenuItemModifierOptionUpdateRequest,
  BranchMenuItemOverrideApi,
  BranchMenuItemVariantResponse,
  BranchMenuItemVariantUpdateRequest,
  ListBranchMenuItemModifiersApiQuery,
  ListBranchMenuItemsApiQuery,
  ListBranchMenuItemVariantsApiQuery,
  UpdateBranchMenuItemOverrideApiRequest,
} from '@/features/menu/types/branch-menu-item-api';
import {
  restaurantBranchMenuActivatePath,
  restaurantBranchMenuAssignmentPath,
  restaurantBranchMenuDeactivatePath,
  restaurantBranchMenuItemActivatePath,
  restaurantBranchMenuItemDeactivatePath,
  restaurantBranchMenuItemModifierActivatePath,
  restaurantBranchMenuItemModifierDeactivatePath,
  restaurantBranchMenuItemModifierPath,
  restaurantBranchMenuItemModifiersListPath,
  restaurantBranchMenuItemOverridePath,
  restaurantBranchMenuItemsListPath,
  restaurantBranchMenuItemVariantActivatePath,
  restaurantBranchMenuItemVariantDeactivatePath,
  restaurantBranchMenuItemVariantPath,
  restaurantBranchMenuItemVariantsListPath,
  restaurantBranchMenuSyncPath,
  restaurantBranchMenuSyncVariantsPath,
  restaurantBranchMenuTreePath,
  restaurantBranchMenusListPath,
} from '@/lib/api/paths';

function authGet(token: string) {
  return { baseUrl: getServerApiBaseUrl(), token, method: 'GET' as const };
}

function authMutate(token: string, method: 'POST' | 'PATCH', body?: unknown) {
  return { baseUrl: getServerApiBaseUrl(), token, method, body };
}

async function authDelete(token: string, path: string): Promise<void> {
  const response = await fetch(new URL(path, getServerApiBaseUrl()), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(response.statusText || 'Branch menu request failed');
  }
}

export async function listBackendBranchMenusByBranchId(
  token: string,
  branchId: string | number,
  query?: ListBranchMenusApiQuery,
): Promise<BranchMenuAssignment[]> {
  const data = await apiFetch<BranchMenuAssignmentApi[] | { items: BranchMenuAssignmentApi[] }>(
    restaurantBranchMenusListPath(branchId, query),
    authGet(token),
  );
  return mapBranchMenuAssignmentsApi(unwrapBranchMenuAssignmentList(data));
}

export async function getBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenuAssignmentPath(branchId, assignmentId),
    authGet(token),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function assignBackendBranchMenuByBranchId(
  token: string,
  branchId: string | number,
  body: AssignBranchMenuApiRequest,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenusListPath(branchId),
    authMutate(token, 'POST', body),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function updateBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  body: UpdateBranchMenuApiRequest,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenuAssignmentPath(branchId, assignmentId),
    authMutate(token, 'PATCH', body),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function deleteBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
): Promise<void> {
  await authDelete(token, restaurantBranchMenuAssignmentPath(branchId, assignmentId));
}

export async function getBackendBranchMenuTree(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  query?: BranchMenuTreeApiQuery,
): Promise<BranchMenuTree> {
  const data = await apiFetch<BranchMenuTreeApi>(
    restaurantBranchMenuTreePath(branchId, assignmentId, query),
    authGet(token),
  );
  return mapBranchMenuTreeApi(data);
}

export async function syncBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenuSyncPath(branchId, assignmentId),
    authMutate(token, 'POST'),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function syncBackendBranchMenuVariants(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenuSyncVariantsPath(branchId, assignmentId),
    authMutate(token, 'POST'),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function activateBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenuActivatePath(branchId, assignmentId),
    authMutate(token, 'POST'),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function deactivateBackendBranchMenuAssignment(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
): Promise<BranchMenuAssignment> {
  const data = await apiFetch<BranchMenuAssignmentApi>(
    restaurantBranchMenuDeactivatePath(branchId, assignmentId),
    authMutate(token, 'POST'),
  );
  return mapBranchMenuAssignmentApi(data);
}

export async function listBackendBranchMenuItemOverrides(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  query?: ListBranchMenuItemsApiQuery,
): Promise<BranchMenuItemOverrideApi[]> {
  const data = await apiFetch<BranchMenuItemOverrideApi[] | { items: BranchMenuItemOverrideApi[] }>(
    restaurantBranchMenuItemsListPath(branchId, assignmentId, query),
    authGet(token),
  );
  return unwrapBranchMenuItemOverrideList(data);
}

export async function getBackendBranchMenuItemOverride(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): Promise<BranchMenuItemOverrideApi> {
  return apiFetch<BranchMenuItemOverrideApi>(
    restaurantBranchMenuItemOverridePath(branchId, assignmentId, itemOverrideId),
    authGet(token),
  );
}

export async function updateBackendBranchMenuItemOverride(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  body: UpdateBranchMenuItemOverrideApiRequest,
): Promise<BranchMenuItemOverrideApi> {
  return apiFetch<BranchMenuItemOverrideApi>(
    restaurantBranchMenuItemOverridePath(branchId, assignmentId, itemOverrideId),
    authMutate(token, 'PATCH', body),
  );
}

export async function activateBackendBranchMenuItemOverride(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): Promise<BranchMenuItemOverrideApi> {
  return apiFetch<BranchMenuItemOverrideApi>(
    restaurantBranchMenuItemActivatePath(branchId, assignmentId, itemOverrideId),
    authMutate(token, 'POST'),
  );
}

export async function deactivateBackendBranchMenuItemOverride(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): Promise<BranchMenuItemOverrideApi> {
  return apiFetch<BranchMenuItemOverrideApi>(
    restaurantBranchMenuItemDeactivatePath(branchId, assignmentId, itemOverrideId),
    authMutate(token, 'POST'),
  );
}

// Branch menu item variants ---------------------------------------------------

export async function listBackendBranchMenuItemVariants(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  query?: ListBranchMenuItemVariantsApiQuery,
): Promise<BranchMenuItemVariantResponse[]> {
  const data = await apiFetch<
    BranchMenuItemVariantResponse[] | { items: BranchMenuItemVariantResponse[] }
  >(
    restaurantBranchMenuItemVariantsListPath(branchId, assignmentId, itemOverrideId, query),
    authGet(token),
  );
  return unwrapBranchMenuItemVariantList(data);
}

export async function getBackendBranchMenuItemVariant(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): Promise<BranchMenuItemVariantResponse> {
  return apiFetch<BranchMenuItemVariantResponse>(
    restaurantBranchMenuItemVariantPath(branchId, assignmentId, itemOverrideId, variantOverrideId),
    authGet(token),
  );
}

export async function updateBackendBranchMenuItemVariant(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
  body: BranchMenuItemVariantUpdateRequest,
): Promise<BranchMenuItemVariantResponse> {
  return apiFetch<BranchMenuItemVariantResponse>(
    restaurantBranchMenuItemVariantPath(branchId, assignmentId, itemOverrideId, variantOverrideId),
    authMutate(token, 'PATCH', body),
  );
}

export async function activateBackendBranchMenuItemVariant(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): Promise<BranchMenuItemVariantResponse> {
  return apiFetch<BranchMenuItemVariantResponse>(
    restaurantBranchMenuItemVariantActivatePath(
      branchId,
      assignmentId,
      itemOverrideId,
      variantOverrideId,
    ),
    authMutate(token, 'POST'),
  );
}

export async function deactivateBackendBranchMenuItemVariant(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): Promise<BranchMenuItemVariantResponse> {
  return apiFetch<BranchMenuItemVariantResponse>(
    restaurantBranchMenuItemVariantDeactivatePath(
      branchId,
      assignmentId,
      itemOverrideId,
      variantOverrideId,
    ),
    authMutate(token, 'POST'),
  );
}

// Branch menu item modifiers ---------------------------------------------------

export async function listBackendBranchMenuItemModifiers(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  query?: ListBranchMenuItemModifiersApiQuery,
): Promise<BranchMenuItemModifierOptionResponse[]> {
  const data = await apiFetch<
    BranchMenuItemModifierOptionResponse[] | { items: BranchMenuItemModifierOptionResponse[] }
  >(
    restaurantBranchMenuItemModifiersListPath(branchId, assignmentId, itemOverrideId, query),
    authGet(token),
  );
  return unwrapBranchMenuItemModifierList(data);
}

export async function getBackendBranchMenuItemModifier(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): Promise<BranchMenuItemModifierOptionResponse> {
  return apiFetch<BranchMenuItemModifierOptionResponse>(
    restaurantBranchMenuItemModifierPath(
      branchId,
      assignmentId,
      itemOverrideId,
      modifierOverrideId,
    ),
    authGet(token),
  );
}

export async function updateBackendBranchMenuItemModifier(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
  body: BranchMenuItemModifierOptionUpdateRequest,
): Promise<BranchMenuItemModifierOptionResponse> {
  return apiFetch<BranchMenuItemModifierOptionResponse>(
    restaurantBranchMenuItemModifierPath(
      branchId,
      assignmentId,
      itemOverrideId,
      modifierOverrideId,
    ),
    authMutate(token, 'PATCH', body),
  );
}

export async function activateBackendBranchMenuItemModifier(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): Promise<BranchMenuItemModifierOptionResponse> {
  return apiFetch<BranchMenuItemModifierOptionResponse>(
    restaurantBranchMenuItemModifierActivatePath(
      branchId,
      assignmentId,
      itemOverrideId,
      modifierOverrideId,
    ),
    authMutate(token, 'POST'),
  );
}

export async function deactivateBackendBranchMenuItemModifier(
  token: string,
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): Promise<BranchMenuItemModifierOptionResponse> {
  return apiFetch<BranchMenuItemModifierOptionResponse>(
    restaurantBranchMenuItemModifierDeactivatePath(
      branchId,
      assignmentId,
      itemOverrideId,
      modifierOverrideId,
    ),
    authMutate(token, 'POST'),
  );
}

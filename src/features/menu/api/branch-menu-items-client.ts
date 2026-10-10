import { clientApi } from '@/lib/client-api';
import { unwrapBffData } from '@/lib/bff-envelope';
import {
  unwrapBranchMenuItemModifierList,
  unwrapBranchMenuItemOverrideList,
  unwrapBranchMenuItemVariantList,
} from './branch-menu-item-overrides-map';
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
} from '../types/branch-menu-item-api';

function buildQueryString(query?: { status?: string; page?: number; page_size?: number }): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.page != null) params.set('page', String(query.page));
  if (query.page_size != null) params.set('page_size', String(query.page_size));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function itemsBasePath(branchId: string | number, assignmentId: string | number): string {
  return `/menu/branches/${encodeURIComponent(String(branchId))}/menus/${encodeURIComponent(String(assignmentId))}/items`;
}

function itemPath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): string {
  return `${itemsBasePath(branchId, assignmentId)}/${encodeURIComponent(String(itemOverrideId))}`;
}

// -----------------------------------------------------------------------------
// Branch Menu Items
// -----------------------------------------------------------------------------

export async function fetchBranchMenuItemsClient(
  branchId: string | number,
  assignmentId: string | number,
  query?: ListBranchMenuItemsApiQuery,
): Promise<BranchMenuItemOverrideApi[]> {
  const res = await clientApi.get<unknown>(
    `${itemsBasePath(branchId, assignmentId)}${buildQueryString(query)}`,
  );
  const data = unwrapBffData<unknown>(res);
  return unwrapBranchMenuItemOverrideList(data);
}

export async function fetchBranchMenuItemClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): Promise<BranchMenuItemOverrideApi> {
  const res = await clientApi.get<unknown>(itemPath(branchId, assignmentId, itemOverrideId));
  return unwrapBffData<BranchMenuItemOverrideApi>(res);
}

export async function updateBranchMenuItemClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  body: UpdateBranchMenuItemOverrideApiRequest,
): Promise<BranchMenuItemOverrideApi> {
  const res = await clientApi.patch<unknown>(
    itemPath(branchId, assignmentId, itemOverrideId),
    body,
  );
  return unwrapBffData<BranchMenuItemOverrideApi>(res);
}

export async function activateBranchMenuItemClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): Promise<BranchMenuItemOverrideApi> {
  const res = await clientApi.post<unknown>(
    `${itemPath(branchId, assignmentId, itemOverrideId)}/activate`,
    {},
  );
  return unwrapBffData<BranchMenuItemOverrideApi>(res);
}

export async function deactivateBranchMenuItemClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): Promise<BranchMenuItemOverrideApi> {
  const res = await clientApi.post<unknown>(
    `${itemPath(branchId, assignmentId, itemOverrideId)}/deactivate`,
    {},
  );
  return unwrapBffData<BranchMenuItemOverrideApi>(res);
}

// -----------------------------------------------------------------------------
// Branch Menu Item Variants
// -----------------------------------------------------------------------------

function variantsBasePath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): string {
  return `${itemPath(branchId, assignmentId, itemOverrideId)}/variants`;
}

function variantPath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): string {
  return `${variantsBasePath(branchId, assignmentId, itemOverrideId)}/${encodeURIComponent(String(variantOverrideId))}`;
}

export async function fetchBranchMenuItemVariantsClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  query?: ListBranchMenuItemVariantsApiQuery,
): Promise<BranchMenuItemVariantResponse[]> {
  const res = await clientApi.get<unknown>(
    `${variantsBasePath(branchId, assignmentId, itemOverrideId)}${buildQueryString(query)}`,
  );
  const data = unwrapBffData<unknown>(res);
  return unwrapBranchMenuItemVariantList(data);
}

export async function fetchBranchMenuItemVariantClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): Promise<BranchMenuItemVariantResponse> {
  const res = await clientApi.get<unknown>(
    variantPath(branchId, assignmentId, itemOverrideId, variantOverrideId),
  );
  return unwrapBffData<BranchMenuItemVariantResponse>(res);
}

export async function updateBranchMenuItemVariantClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
  body: BranchMenuItemVariantUpdateRequest,
): Promise<BranchMenuItemVariantResponse> {
  const res = await clientApi.patch<unknown>(
    variantPath(branchId, assignmentId, itemOverrideId, variantOverrideId),
    body,
  );
  return unwrapBffData<BranchMenuItemVariantResponse>(res);
}

export async function activateBranchMenuItemVariantClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): Promise<BranchMenuItemVariantResponse> {
  const res = await clientApi.post<unknown>(
    `${variantPath(branchId, assignmentId, itemOverrideId, variantOverrideId)}/activate`,
    {},
  );
  return unwrapBffData<BranchMenuItemVariantResponse>(res);
}

export async function deactivateBranchMenuItemVariantClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  variantOverrideId: string | number,
): Promise<BranchMenuItemVariantResponse> {
  const res = await clientApi.post<unknown>(
    `${variantPath(branchId, assignmentId, itemOverrideId, variantOverrideId)}/deactivate`,
    {},
  );
  return unwrapBffData<BranchMenuItemVariantResponse>(res);
}

// -----------------------------------------------------------------------------
// Branch Menu Item Modifiers
// -----------------------------------------------------------------------------

function modifiersBasePath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
): string {
  return `${itemPath(branchId, assignmentId, itemOverrideId)}/modifiers`;
}

function modifierPath(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): string {
  return `${modifiersBasePath(branchId, assignmentId, itemOverrideId)}/${encodeURIComponent(String(modifierOverrideId))}`;
}

export async function fetchBranchMenuItemModifiersClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  query?: ListBranchMenuItemModifiersApiQuery,
): Promise<BranchMenuItemModifierOptionResponse[]> {
  const res = await clientApi.get<unknown>(
    `${modifiersBasePath(branchId, assignmentId, itemOverrideId)}${buildQueryString(query)}`,
  );
  const data = unwrapBffData<unknown>(res);
  return unwrapBranchMenuItemModifierList(data);
}

export async function fetchBranchMenuItemModifierClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): Promise<BranchMenuItemModifierOptionResponse> {
  const res = await clientApi.get<unknown>(
    modifierPath(branchId, assignmentId, itemOverrideId, modifierOverrideId),
  );
  return unwrapBffData<BranchMenuItemModifierOptionResponse>(res);
}

export async function updateBranchMenuItemModifierClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
  body: BranchMenuItemModifierOptionUpdateRequest,
): Promise<BranchMenuItemModifierOptionResponse> {
  const res = await clientApi.patch<unknown>(
    modifierPath(branchId, assignmentId, itemOverrideId, modifierOverrideId),
    body,
  );
  return unwrapBffData<BranchMenuItemModifierOptionResponse>(res);
}

export async function activateBranchMenuItemModifierClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): Promise<BranchMenuItemModifierOptionResponse> {
  const res = await clientApi.post<unknown>(
    `${modifierPath(branchId, assignmentId, itemOverrideId, modifierOverrideId)}/activate`,
    {},
  );
  return unwrapBffData<BranchMenuItemModifierOptionResponse>(res);
}

export async function deactivateBranchMenuItemModifierClient(
  branchId: string | number,
  assignmentId: string | number,
  itemOverrideId: string | number,
  modifierOverrideId: string | number,
): Promise<BranchMenuItemModifierOptionResponse> {
  const res = await clientApi.post<unknown>(
    `${modifierPath(branchId, assignmentId, itemOverrideId, modifierOverrideId)}/deactivate`,
    {},
  );
  return unwrapBffData<BranchMenuItemModifierOptionResponse>(res);
}

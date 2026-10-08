import { clientApi } from '@/lib/client-api';
import type {
  CreateModifierGroupInput,
  CreateModifierOptionInput,
  ModifierGroup,
  ModifierOption,
  UpdateModifierGroupInput,
  UpdateModifierOptionInput,
} from '../types/modifier-group';
import type {
  CreateModifierGroupApiRequest,
  CreateModifierOptionApiRequest,
  ListModifierGroupsApiQuery,
  ListModifierOptionsApiQuery,
  ModifierGroupApi,
  ModifierGroupId,
  ModifierOptionApi,
  ModifierOptionId,
  UpdateModifierGroupApiRequest,
  UpdateModifierOptionApiRequest,
} from '../types/modifier-group-api';

export function mapModifierGroupApi(group: ModifierGroupApi): ModifierGroup {
  return {
    id: String(group.id),
    name: group.name,
    minSelect: group.min_select,
    maxSelect: group.max_select,
    isRequired: group.is_required,
    status: group.status,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
  };
}

export function mapModifierGroupsApi(groups: readonly ModifierGroupApi[]): ModifierGroup[] {
  return groups.map(mapModifierGroupApi);
}

export function mapModifierOptionApi(option: ModifierOptionApi, groupId: string): ModifierOption {
  return {
    id: String(option.id),
    groupId: String(option.modifier_group_id ?? groupId),
    name: option.name,
    priceDelta: option.price_delta,
    displayOrder: option.display_order,
    status: option.status,
    createdAt: option.created_at,
    updatedAt: option.updated_at,
  };
}

export function mapModifierOptionsApi(
  options: readonly ModifierOptionApi[],
  groupId: string,
): ModifierOption[] {
  return options.map((option) => mapModifierOptionApi(option, groupId));
}

export function unwrapModifierGroupList(data: unknown): ModifierGroupApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ModifierGroupApi[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['items', 'data', 'groups']) {
      if (Array.isArray(obj[key])) return obj[key] as ModifierGroupApi[];
    }
  }
  return [];
}

export function unwrapModifierOptionList(data: unknown): ModifierOptionApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ModifierOptionApi[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['items', 'data', 'options']) {
      if (Array.isArray(obj[key])) return obj[key] as ModifierOptionApi[];
    }
  }
  return [];
}

export function toCreateModifierGroupPayload(
  input: CreateModifierGroupInput,
): CreateModifierGroupApiRequest {
  return {
    name: input.name.trim(),
    min_select: input.minSelect ?? 0,
    max_select: input.maxSelect ?? 1,
    is_required: input.isRequired ?? false,
  };
}

export function toUpdateModifierGroupPayload(
  input: UpdateModifierGroupInput,
): UpdateModifierGroupApiRequest {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.minSelect !== undefined) payload.min_select = input.minSelect;
  if (input.maxSelect !== undefined) payload.max_select = input.maxSelect;
  if (input.isRequired !== undefined) payload.is_required = input.isRequired;
  if (input.status !== undefined) payload.status = input.status;
  return payload as UpdateModifierGroupApiRequest;
}

export function toCreateModifierOptionPayload(
  input: CreateModifierOptionInput,
): CreateModifierOptionApiRequest {
  return {
    name: input.name.trim(),
    price_delta: input.priceDelta ?? 0,
    display_order: input.displayOrder ?? 0,
  };
}

export function toUpdateModifierOptionPayload(
  input: UpdateModifierOptionInput,
): UpdateModifierOptionApiRequest {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.priceDelta !== undefined) payload.price_delta = input.priceDelta;
  if (input.displayOrder !== undefined) payload.display_order = input.displayOrder;
  if (input.status !== undefined) payload.status = input.status;
  return payload as UpdateModifierOptionApiRequest;
}

export async function fetchModifierGroupsClient(
  query?: ListModifierGroupsApiQuery,
): Promise<ModifierGroup[]> {
  const params = new URLSearchParams();
  if (query?.status) params.set('status', query.status);
  const qs = params.toString();
  const res = await clientApi.get<{ success?: boolean; data?: unknown }>(
    `/menu/modifier-groups${qs ? `?${qs}` : ''}`,
  );
  const list = unwrapModifierGroupList(res?.data ?? res);
  return mapModifierGroupsApi(list);
}

export async function fetchModifierGroupByIdClient(
  groupId: ModifierGroupId,
): Promise<ModifierGroup | null> {
  const res = await clientApi.get<{ success?: boolean; data?: ModifierGroupApi }>(
    `/menu/modifier-groups/${encodeURIComponent(groupId)}`,
  );
  if (!res?.data) return null;
  return mapModifierGroupApi(res.data);
}

export async function createModifierGroupClient(
  input: CreateModifierGroupInput,
): Promise<ModifierGroup> {
  const body = toCreateModifierGroupPayload(input);
  const res = await clientApi.post<{ success?: boolean; data?: ModifierGroupApi }>(
    '/menu/modifier-groups',
    body,
  );
  if (!res?.data) throw new Error('Failed to create modifier group');
  return mapModifierGroupApi(res.data);
}

export async function updateModifierGroupClient(
  groupId: ModifierGroupId,
  input: UpdateModifierGroupInput,
): Promise<ModifierGroup> {
  const body = toUpdateModifierGroupPayload(input);
  const res = await clientApi.patch<{ success?: boolean; data?: ModifierGroupApi }>(
    `/menu/modifier-groups/${encodeURIComponent(groupId)}`,
    body,
  );
  if (!res?.data) throw new Error('Failed to update modifier group');
  return mapModifierGroupApi(res.data);
}

export async function fetchModifierOptionsClient(
  groupId: ModifierGroupId,
  query?: ListModifierOptionsApiQuery,
): Promise<ModifierOption[]> {
  const params = new URLSearchParams();
  if (query?.status) params.set('status', query.status);
  const qs = params.toString();
  const res = await clientApi.get<{ success?: boolean; data?: unknown }>(
    `/menu/modifier-groups/${encodeURIComponent(groupId)}/options${qs ? `?${qs}` : ''}`,
  );
  const list = unwrapModifierOptionList(res?.data ?? res);
  return mapModifierOptionsApi(list, groupId);
}

export async function createModifierOptionClient(
  groupId: ModifierGroupId,
  input: CreateModifierOptionInput,
): Promise<ModifierOption> {
  const body = toCreateModifierOptionPayload(input);
  const res = await clientApi.post<{ success?: boolean; data?: ModifierOptionApi }>(
    `/menu/modifier-groups/${encodeURIComponent(groupId)}/options`,
    body,
  );
  if (!res?.data) throw new Error('Failed to create modifier option');
  return mapModifierOptionApi(res.data, groupId);
}

export async function updateModifierOptionClient(
  groupId: ModifierGroupId,
  optionId: ModifierOptionId,
  input: UpdateModifierOptionInput,
): Promise<ModifierOption> {
  const body = toUpdateModifierOptionPayload(input);
  const res = await clientApi.patch<{ success?: boolean; data?: ModifierOptionApi }>(
    `/menu/modifier-groups/${encodeURIComponent(groupId)}/options/${encodeURIComponent(optionId)}`,
    body,
  );
  if (!res?.data) throw new Error('Failed to update modifier option');
  return mapModifierOptionApi(res.data, groupId);
}

export function formatModifierGroupLabel(group: ModifierGroup): string {
  const requiredLabel = group.isRequired ? 'Required' : 'Optional';
  return `${group.name} (${group.minSelect}-${group.maxSelect}, ${requiredLabel})`;
}

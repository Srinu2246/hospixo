import type { MenuItemTag } from '../types/menu';
import type {
  CreateMenuItemTagApiRequest,
  MenuItemTagApi,
  UpdateMenuItemTagApiRequest,
} from '../types/menu-item-tag-api';

function mapTagStatus(status: MenuItemTagApi['status']): MenuItemTag['status'] {
  return status === 'active' ? 'Active' : 'Inactive';
}

export function mapMenuItemTagApi(tag: MenuItemTagApi): MenuItemTag {
  return {
    id: String(tag.id),
    name: tag.name,
    code: tag.code,
    status: mapTagStatus(tag.status),
  };
}

export function mapMenuItemTagsApi(tags: readonly MenuItemTagApi[]): MenuItemTag[] {
  return tags.map(mapMenuItemTagApi);
}

export function unwrapMenuItemTagList(data: unknown): MenuItemTagApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    return (data as { items: MenuItemTagApi[] }).items;
  }
  return [];
}

export function toCreateMenuItemTagPayload(input: {
  name: string;
  code: string;
}): CreateMenuItemTagApiRequest {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
  };
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function toUpdateMenuItemTagPayload(input: {
  name?: string;
  code?: string;
  status?: MenuItemTag['status'];
}): UpdateMenuItemTagApiRequest {
  const payload: Writable<UpdateMenuItemTagApiRequest> = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.code !== undefined) payload.code = input.code.trim().toUpperCase();
  if (input.status !== undefined) {
    payload.status = input.status === 'Active' ? 'active' : 'inactive';
  }

  return payload;
}

export function resolveTagIds(tagIds: readonly string[]): number[] {
  return tagIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
}

export function resolveFavoriteAndComboFlags(
  tagIds: readonly string[],
  tagDefinitions: readonly MenuItemTag[],
): { isFavorite: boolean; isCombo: boolean } {
  const selected = tagDefinitions.filter((tag) => tagIds.includes(tag.id));
  return {
    isFavorite: selected.some(
      (tag) => tag.code === 'FAVORITE' || tag.name.toLowerCase() === 'set as favorite',
    ),
    isCombo: selected.some(
      (tag) => tag.code === 'COMBO' || tag.name.toLowerCase() === 'set as combo',
    ),
  };
}

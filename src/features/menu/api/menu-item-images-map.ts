import type { ItemImage } from '../types/menu';
import type {
  CreateMenuItemImageApiRequest,
  MenuItemImageApi,
  UpdateMenuItemImageApiRequest,
} from '../types/menu-item-image-api';

function mapImageStatus(status: MenuItemImageApi['status']): ItemImage['status'] {
  return status === 'active' ? 'Active' : 'Inactive';
}

export function mapMenuItemImageApi(image: MenuItemImageApi): ItemImage {
  return {
    id: String(image.id),
    url: image.url,
    storageKey: image.storage_key,
    mimeType: image.mime_type,
    sortOrder: image.sort_order,
    isPrimary: image.is_primary,
    status: mapImageStatus(image.status),
  };
}

export function mapMenuItemImagesApi(images: readonly MenuItemImageApi[]): ItemImage[] {
  return images.map(mapMenuItemImageApi);
}

export function unwrapMenuItemImageList(
  data: MenuItemImageApi[] | { items: MenuItemImageApi[] } | unknown,
): MenuItemImageApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && 'items' in (data as Record<string, unknown>)) {
    return (data as { items: MenuItemImageApi[] }).items;
  }
  return [];
}

export function getPrimaryMenuItemImageUrl(images: readonly ItemImage[]): string | undefined {
  const activeImages = images.filter((image) => image.status !== 'Inactive');
  return (
    activeImages.find((image) => image.isPrimary)?.url ?? activeImages[0]?.url ?? images[0]?.url
  );
}

export function syncMenuItemPrimaryImage<T extends { image?: string; images?: ItemImage[] }>(
  item: T,
): T {
  const primaryUrl = getPrimaryMenuItemImageUrl(item.images ?? []);
  return primaryUrl ? { ...item, image: primaryUrl } : item;
}

export function toCreateMenuItemImagePayload(input: {
  url: string;
  storageKey: string;
  mimeType: string;
  sortOrder?: number;
  isPrimary?: boolean;
}): CreateMenuItemImageApiRequest {
  return {
    url: input.url,
    storage_key: input.storageKey,
    mime_type: input.mimeType,
    sort_order: input.sortOrder,
    is_primary: input.isPrimary,
  };
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function toUpdateMenuItemImagePayload(input: {
  url?: string;
  storageKey?: string;
  mimeType?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  status?: ItemImage['status'];
}): UpdateMenuItemImageApiRequest {
  const payload: Writable<UpdateMenuItemImageApiRequest> = {};

  if (input.url !== undefined) payload.url = input.url;
  if (input.storageKey !== undefined) payload.storage_key = input.storageKey;
  if (input.mimeType !== undefined) payload.mime_type = input.mimeType;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.isPrimary !== undefined) payload.is_primary = input.isPrimary;
  if (input.status !== undefined) {
    payload.status = input.status === 'Active' ? 'active' : 'inactive';
  }

  return payload;
}

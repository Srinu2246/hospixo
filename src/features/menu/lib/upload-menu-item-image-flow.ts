import { mapMenuItemImageApi } from '../api/menu-item-images-map';
import type { ItemImage } from '../types/menu';
import type { MenuItemId } from '../types/menu-item-api';
import type { MenuItemImageApi } from '../types/menu-item-image-api';

type MenuImageApiResponse<T> = Readonly<{
  success: boolean;
  data?: T;
  message?: string;
}>;

function parseUploadResponse(payload: unknown): ItemImage {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid image upload response.');
  }
  const record = payload as MenuImageApiResponse<MenuItemImageApi> & MenuItemImageApi;
  let data: MenuItemImageApi | null = null;
  if ('success' in record && record.data) {
    data = record.data;
  } else if ('id' in record && 'url' in record) {
    data = record as MenuItemImageApi;
  }
  if (!data?.url) {
    const message =
      'message' in record && typeof record.message === 'string'
        ? record.message
        : 'Failed to upload menu item image.';
    throw new Error(message);
  }
  return mapMenuItemImageApi(data);
}

/**
 * Upload via same-origin BFF proxy so the browser never PUTs to object storage (CORS-safe).
 */
export async function uploadMenuItemImageFlow(
  itemId: MenuItemId,
  file: File,
  options: { sortOrder?: number; isPrimary?: boolean } = {},
): Promise<ItemImage> {
  const encodedItemId = encodeURIComponent(itemId);
  const formData = new FormData();
  formData.append('file', file);
  if (options.sortOrder !== undefined) {
    formData.append('sort_order', String(options.sortOrder));
  }
  if (options.isPrimary) {
    formData.append('is_primary', '1');
  }

  const response = await fetch(`/api/menu/items/${encodedItemId}/images/upload`, {
    method: 'POST',
    credentials: 'same-origin',
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof (payload as { message?: string }).message === 'string'
        ? (payload as { message: string }).message
        : `Failed to upload menu item image (${response.status}).`;
    throw new Error(message);
  }

  return parseUploadResponse(payload);
}

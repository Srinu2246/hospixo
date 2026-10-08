import { createBackendMenuItemImage, createBackendMenuItemImageUploadUrl } from '@/lib/api/menu';
import { ApiRequestError } from '@/lib/api/errors';

import { mapMenuItemImageApi, toCreateMenuItemImagePayload } from '../api/menu-item-images-map';
import type { ItemImage } from '../types/menu';
import type { MenuItemImageApi } from '../types/menu-item-image-api';
import { normalizeMenuItemImageUploadUrl, resolveImageContentType } from './menu-item-image-upload';

async function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const body = Buffer.from(await file.arrayBuffer());
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new ApiRequestError(
      `Image storage upload failed (${response.status}).`,
      response.status,
      detail || undefined,
    );
  }
}

function unwrapMenuItemImageApi(data: unknown): MenuItemImageApi {
  if (!data || typeof data !== 'object') {
    throw new ApiRequestError('Invalid image response from API.', 502);
  }
  const record = data as Record<string, unknown>;
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as MenuItemImageApi;
  }
  return data as MenuItemImageApi;
}

/** Server-side presigned upload (avoids browser CORS to object storage). */
export async function proxyUploadMenuItemImage(
  token: string,
  itemId: string,
  file: File,
  options: Readonly<{ sortOrder?: number; isPrimary?: boolean }> = {},
): Promise<ItemImage> {
  const contentType = resolveImageContentType(file);

  const uploadRaw = await createBackendMenuItemImageUploadUrl(token, itemId, {
    filename: file.name,
    content_type: contentType,
    file_size: file.size,
  });
  const uploadMeta = normalizeMenuItemImageUploadUrl(uploadRaw);

  await putFileToPresignedUrl(uploadMeta.upload_url, file, contentType);

  const createdRaw = await createBackendMenuItemImage(
    token,
    itemId,
    toCreateMenuItemImagePayload({
      url: uploadMeta.publicUrl,
      storageKey: uploadMeta.storage_key,
      mimeType: contentType,
      sortOrder: options.sortOrder,
      isPrimary: options.isPrimary,
    }),
  );

  return mapMenuItemImageApi(unwrapMenuItemImageApi(createdRaw));
}

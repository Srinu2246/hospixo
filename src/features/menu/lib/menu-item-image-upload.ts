import type { MenuItemImageUploadUrlApi } from '../types/menu-item-image-api';

const EXTENSION_TO_MIME: Readonly<Record<string, string>> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Stable MIME for presign + PUT (must match what the backend signed). */
export function resolveImageContentType(file: Pick<File, 'name' | 'type'>): string {
  const fromBrowser = file.type?.trim();
  if (fromBrowser) return fromBrowser;

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && EXTENSION_TO_MIME[extension]) {
    return EXTENSION_TO_MIME[extension];
  }

  return 'application/octet-stream';
}

export type NormalizedMenuItemImageUploadUrl = Readonly<{
  upload_url: string;
  storage_key: string;
  publicUrl: string;
}>;

function unwrapRecord(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const record = data as Record<string, unknown>;
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  return record;
}

/** Backend OpenAPI uses `public_url`; older clients expect `url`. */
export function normalizeMenuItemImageUploadUrl(data: unknown): NormalizedMenuItemImageUploadUrl {
  const record = unwrapRecord(data);
  const upload_url = record.upload_url;
  const storage_key = record.storage_key;
  const publicUrl = record.public_url ?? record.url;

  if (typeof upload_url !== 'string' || !upload_url.trim()) {
    throw new Error('Upload URL was missing from the server response.');
  }
  if (typeof storage_key !== 'string' || !storage_key.trim()) {
    throw new Error('Storage key was missing from the server response.');
  }
  if (typeof publicUrl !== 'string' || !publicUrl.trim()) {
    throw new Error('Public image URL was missing from the server response.');
  }

  return {
    upload_url: upload_url.trim(),
    storage_key: storage_key.trim(),
    publicUrl: publicUrl.trim(),
  };
}

export function toMenuItemImageUploadUrlApi(
  normalized: NormalizedMenuItemImageUploadUrl,
): MenuItemImageUploadUrlApi {
  return {
    upload_url: normalized.upload_url,
    storage_key: normalized.storage_key,
    url: normalized.publicUrl,
  };
}

import { resolveImageContentType } from './menu-item-image-upload';

export async function uploadFileToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  const contentType = resolveImageContentType(file);
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      detail.trim()
        ? `Failed to upload image file (${response.status}): ${detail.slice(0, 200)}`
        : `Failed to upload image file (${response.status}). The storage bucket may block browser uploads (CORS).`,
    );
  }
}

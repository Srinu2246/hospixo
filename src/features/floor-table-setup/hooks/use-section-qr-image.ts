'use client';

import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';

export const sectionQrImageQueryKey = (menuUrl: string | null) =>
  ['floor-table-setup', 'section-qr', menuUrl] as const;

async function generateSectionQrDataUrl(menuUrl: string): Promise<string> {
  return QRCode.toDataURL(menuUrl, {
    width: 280,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
}

export function useSectionQrImage(menuUrl: string | null): {
  dataUrl: string | null;
  error: string | null;
  isPending: boolean;
} {
  const { data, error, isPending } = useQuery({
    queryKey: sectionQrImageQueryKey(menuUrl),
    queryFn: () => generateSectionQrDataUrl(menuUrl!),
    enabled: menuUrl != null && menuUrl.length > 0,
  });

  return {
    dataUrl: data ?? null,
    error: error instanceof Error ? error.message : error ? 'Unable to generate QR code.' : null,
    isPending,
  };
}

import type { FloorSection } from '@/features/floor-table-setup/types/floor-table-setup';

export function slugifyOutletLabel(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'outlet';
}

type BuildSectionGuestMenuUrlInput = Readonly<{
  outletLabel: string;
  outletId?: string | null;
  section: Pick<FloorSection, 'id' | 'code' | 'name'>;
}>;

/** Guest menu deep link encoded in section QR codes. */
export function buildSectionGuestMenuUrl({
  outletLabel,
  outletId,
  section,
}: BuildSectionGuestMenuUrlInput): string {
  const base = (process.env.NEXT_PUBLIC_GUEST_MENU_BASE_URL ?? 'https://menu.hospixo.com').replace(
    /\/$/,
    '',
  );
  const slug =
    slugifyOutletLabel(outletLabel) || (outletId != null ? `outlet-${outletId}` : 'guest');
  const sectionKey = section.code?.trim() || section.id;
  return `${base}/${slug}/guest-menu?section=${encodeURIComponent(sectionKey)}`;
}

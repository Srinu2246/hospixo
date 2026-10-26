export type SectionGuestMenuTarget = Readonly<{
  id: string;
  name?: string;
}>;

export function parsePositiveIntId(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

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
  section: SectionGuestMenuTarget;
  floorId: string | number;
  branchId: string | number;
  menuId: string | number;
}>;

function resolveGuestMenuBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_GUEST_MENU_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) return appUrl.replace(/\/$/, '');
  return 'http://localhost:3004';
}

/** Guest menu deep link encoded in section QR codes (public menu API query params). */
export function buildSectionGuestMenuUrl({
  outletLabel,
  outletId,
  section,
  floorId,
  branchId,
  menuId,
}: BuildSectionGuestMenuUrlInput): string | null {
  const branch_id = parsePositiveIntId(branchId);
  const floor_id = parsePositiveIntId(floorId);
  const section_id = parsePositiveIntId(section.id);
  const menu_id = parsePositiveIntId(menuId);

  if (branch_id == null || floor_id == null || section_id == null || menu_id == null) {
    return null;
  }

  const base = resolveGuestMenuBaseUrl();
  const params = new URLSearchParams({
    branch_id: String(branch_id),
    floor_id: String(floor_id),
    section_id: String(section_id),
    menu_id: String(menu_id),
  });
  const outletSlug =
    slugifyOutletLabel(outletLabel) || (outletId != null ? `outlet-${outletId}` : 'guest');
  params.set('outlet', outletSlug);
  return `${base}/guest-menu?${params.toString()}`;
}

/** Coerce sidebar / API branch ids (number or numeric string) for hooks and realtime. */
export function resolveBranchId(
  ...candidates: Array<number | string | null | undefined>
): number | undefined {
  for (const raw of candidates) {
    if (raw == null || raw === '') continue;
    const id = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return undefined;
}

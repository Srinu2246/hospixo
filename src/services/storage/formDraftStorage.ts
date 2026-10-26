const FORM_DRAFT_KEY_PREFIX = 'hospixo.formDraft.v1';

/** Stable localStorage key for a form draft (namespace + scope segments). */
export function formDraftStorageKey(parts: readonly string[]): string {
  const encoded = parts.map((part) => encodeURIComponent(part.trim() || '_')).join(':');
  return `${FORM_DRAFT_KEY_PREFIX}:${encoded}`;
}

export function readFormDraft<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeFormDraft<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private mode — ignore so the form still works without persistence.
  }
}

export function clearFormDraft(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

const FORM_DRAFT_KEY_PREFIX = 'hospixo.formDraft.v1';

/** Stable localStorage key for a form draft (namespace + scope segments). */
export function formDraftStorageKey(parts: readonly string[]): string {
  const encoded = parts.map((part) => encodeURIComponent(part.trim() || '_')).join(':');
  return `${FORM_DRAFT_KEY_PREFIX}:${encoded}`;
}

type DraftFormValues = { password?: string };

type DraftWithFormValues = {
  formValues?: DraftFormValues;
};

/** Keeps a stored password when a new write omits or clears it (wizard debounced saves). */
function mergeStoredPasswordIfMissing<T>(key: string, next: T): T {
  if (typeof next !== 'object' || next === null) return next;

  const nextDraft = next as DraftWithFormValues;
  if (!nextDraft.formValues) return next;

  const nextPassword = nextDraft.formValues.password?.trim();
  if (nextPassword) return next;

  const existing = readFormDraft<DraftWithFormValues>(key);
  const storedPassword = existing?.formValues?.password?.trim();
  if (!storedPassword) return next;

  return {
    ...next,
    formValues: {
      ...nextDraft.formValues,
      password: storedPassword,
    },
  } as T;
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

/** Writes a draft to localStorage; preserves password on partial writes when applicable. */
export function writeFormDraft<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = mergeStoredPasswordIfMissing(key, value);
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Quota or private mode — ignore so the form still works without persistence.
  }
}

export function clearFormDraft(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

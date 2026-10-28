'use client';

import { useSyncExternalStore } from 'react';

import {
  createUserDraftSchema,
  trySerializeCreateUserDraft,
  toCreateUserDraftHydration,
  type CreateUserDraftSource,
} from '@/lib/schemas/employees/user-roles/createUserDraftSchema';
import {
  resolveWizardActiveRoleName,
  type CreateUserStep,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  clearFormDraft,
  formDraftStorageKey,
  readFormDraft,
  writeFormDraft,
} from '@/services/storage/formDraftStorage';
import { useCreateUserStore } from '@/stores/createUserStore';

const PERSIST_DEBOUNCE_MS = 400;

/** Per storage key — mirrors former `useState(false)` + microtask ready flip. */
const draftReadyByKey = new Map<string, boolean>();

export function resolveCreateUserFormDraftStorageKey(scope: ScopeType, routeRoot: string): string {
  return formDraftStorageKey(['create-user', scope, routeRoot]);
}

function readDraftState(storageKey: string) {
  const raw = readFormDraft(storageKey);
  return createUserDraftSchema.safeParse(raw);
}

function persistDraft(
  storageKey: string,
  state: CreateUserDraftSource,
  step: CreateUserStep,
): void {
  const resolvedRole = resolveWizardActiveRoleName({
    formRole: state.formValues.role,
    selectedTemplate: state.selectedTemplate,
    selectedRoleId: state.selectedRoleId,
  });
  const draft = trySerializeCreateUserDraft(
    {
      ...state,
      formValues: {
        ...state.formValues,
        ...(resolvedRole ? { role: resolvedRole } : {}),
      },
    },
    step,
  );
  if (draft) writeFormDraft(storageKey, draft);
}

function subscribeCreateUserDraftHydration(
  storageKey: string,
  onStoreChange: () => void,
): () => void {
  const parsed = readDraftState(storageKey);
  if (parsed.success) {
    useCreateUserStore.getState().hydrateDraft(toCreateUserDraftHydration(parsed.data));
  }

  draftReadyByKey.set(storageKey, false);
  queueMicrotask(() => {
    draftReadyByKey.set(storageKey, true);
    onStoreChange();
  });

  return () => {
    draftReadyByKey.delete(storageKey);
  };
}

function subscribeCreateUserDraftPersistence(
  storageKey: string,
  currentStep: CreateUserStep,
): () => void {
  if (currentStep === 'success') {
    return () => undefined;
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const flushDraft = () => {
    const state = useCreateUserStore.getState();
    persistDraft(
      storageKey,
      {
        scope: state.scope,
        selectedTemplate: state.selectedTemplate,
        selectedRoleId: state.selectedRoleId,
        formValues: state.formValues,
        categories: state.categories,
      },
      currentStep,
    );
  };

  flushDraft();

  const unsubscribe = useCreateUserStore.subscribe((state, prevState) => {
    if (state.formValues.password !== prevState.formValues.password) {
      if (debounceTimer) clearTimeout(debounceTimer);
      flushDraft();
      return;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flushDraft, PERSIST_DEBOUNCE_MS);
  });

  const handlePageExit = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    flushDraft();
  };

  window.addEventListener('pagehide', handlePageExit);
  window.addEventListener('beforeunload', handlePageExit);

  return () => {
    unsubscribe();
    if (debounceTimer) clearTimeout(debounceTimer);
    window.removeEventListener('pagehide', handlePageExit);
    window.removeEventListener('beforeunload', handlePageExit);
  };
}

/** Restore create-user wizard fields on refresh; persist while the flow is open (no useEffect). */
export function useCreateUserFormDraft(
  storageKey: string,
  options: { currentStep: CreateUserStep },
): { isDraftReady: boolean } {
  const { currentStep } = options;

  // Hydration must run before persistence — an immediate flush with the default store
  // would overwrite localStorage (password merge keeps only the password field).
  const isDraftReady = useSyncExternalStore(
    (onStoreChange) => subscribeCreateUserDraftHydration(storageKey, onStoreChange),
    () => draftReadyByKey.get(storageKey) ?? false,
    () => false,
  );

  useSyncExternalStore(
    () => subscribeCreateUserDraftPersistence(storageKey, currentStep),
    () => 0,
    () => 0,
  );

  return { isDraftReady };
}

/** Snapshot after create so success page survives refresh (password omitted). */
export function saveCreateUserSuccessSnapshot(
  storageKey: string,
  state: CreateUserDraftSource,
): void {
  const draft = trySerializeCreateUserDraft(
    {
      ...state,
      formValues: { ...state.formValues, password: '' },
    },
    'success',
  );
  if (draft) {
    clearFormDraft(storageKey);
    writeFormDraft(storageKey, draft);
  }
}

export function clearCreateUserFormDraft(storageKey: string): void {
  clearFormDraft(storageKey);
}

'use client';

import { useCallback, useEffect, useState } from 'react';

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

/** Restore create-user wizard fields on refresh; persist while the flow is open. */
export function useCreateUserFormDraft(
  storageKey: string,
  options: { currentStep: CreateUserStep },
): { isDraftReady: boolean } {
  const { currentStep } = options;
  const hydrateDraft = useCreateUserStore((state) => state.hydrateDraft);
  const [isDraftReady, setIsDraftReady] = useState(false);

  const flushDraft = useCallback(() => {
    if (currentStep === 'success') return;
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
  }, [currentStep, storageKey]);

  useEffect(() => {
    const parsed = readDraftState(storageKey);
    if (parsed.success) {
      hydrateDraft(toCreateUserDraftHydration(parsed.data));
    }

    queueMicrotask(() => {
      setIsDraftReady(true);
    });
  }, [hydrateDraft, storageKey]);

  useEffect(() => {
    if (currentStep === 'success') return undefined;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const schedulePersist = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flushDraft, PERSIST_DEBOUNCE_MS);
    };

    flushDraft();
    const unsubscribe = useCreateUserStore.subscribe((state, prevState) => {
      if (state.formValues.password !== prevState.formValues.password) {
        if (debounceTimer) clearTimeout(debounceTimer);
        flushDraft();
        return;
      }
      schedulePersist();
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
  }, [currentStep, flushDraft, storageKey]);

  return { isDraftReady };
}

export function clearCreateUserFormDraft(storageKey: string): void {
  clearFormDraft(storageKey);
}

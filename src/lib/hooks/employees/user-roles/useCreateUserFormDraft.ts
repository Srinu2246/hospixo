'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  createUserDraftSchema,
  trySerializeCreateUserDraft,
  toCreateUserDraftHydration,
  type CreateUserDraftSource,
} from '@/lib/schemas/employees/user-roles/createUserDraftSchema';
import type { CreateUserStep, ScopeType } from '@/lib/schemas/employees/user-roles/userRolesSchema';
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
  const draft = trySerializeCreateUserDraft(state, step);
  if (draft) writeFormDraft(storageKey, draft);
}

/** Restore create-user wizard fields on refresh; persist while the flow is open. */
export function useCreateUserFormDraft(
  storageKey: string,
  options: { enabled?: boolean; currentStep: CreateUserStep },
): { isDraftReady: boolean } {
  const { enabled = true, currentStep } = options;
  const hydrateDraft = useCreateUserStore((state) => state.hydrateDraft);
  const [isDraftReady, setIsDraftReady] = useState(false);

  const flushDraft = useCallback(() => {
    if (!enabled || currentStep === 'success') return;
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
  }, [currentStep, enabled, storageKey]);

  useEffect(() => {
    if (enabled) {
      const parsed = readDraftState(storageKey);
      if (parsed.success) {
        hydrateDraft(toCreateUserDraftHydration(parsed.data));
      }
    }

    queueMicrotask(() => {
      setIsDraftReady(true);
    });
  }, [enabled, hydrateDraft, storageKey]);

  useEffect(() => {
    if (!enabled) return undefined;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const schedulePersist = () => {
      if (currentStep === 'success') return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flushDraft, PERSIST_DEBOUNCE_MS);
    };

    flushDraft();
    const unsubscribe = useCreateUserStore.subscribe(schedulePersist);

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
  }, [currentStep, enabled, flushDraft, storageKey]);

  return { isDraftReady };
}

export function clearCreateUserFormDraft(storageKey: string): void {
  clearFormDraft(storageKey);
}

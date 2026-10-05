'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { organizationCreateDefaults } from '@/constants/admin/organization-create';
import type {
  OrganizationCreateFormData,
  OrganizationCreateResult,
  OrganizationCreateStepId,
} from '@/types/organization-create';

interface OrganizationCreateContextValue {
  data: OrganizationCreateFormData;
  result: OrganizationCreateResult | null;
  draftOrganizationId: string | null;
  updateSection: <K extends keyof OrganizationCreateFormData>(
    section: K,
    values: Partial<OrganizationCreateFormData[K]>,
  ) => void;
  setResult: (result: OrganizationCreateResult) => void;
  setDraftOrganizationId: (draftOrganizationId: string | null) => void;
  hydrateDraft: (draftOrganizationId: string, data: OrganizationCreateFormData) => void;
  reset: () => void;
  getStepIndex: (stepId: OrganizationCreateStepId) => number;
}

const OrganizationCreateContext = createContext<OrganizationCreateContextValue | null>(null);

export function OrganizationCreateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [data, setData] = useState<OrganizationCreateFormData>(organizationCreateDefaults);
  const [result, setResult] = useState<OrganizationCreateResult | null>(null);
  const [draftOrganizationId, setDraftOrganizationId] = useState<string | null>(null);

  const updateSection = useCallback(
    <K extends keyof OrganizationCreateFormData>(
      section: K,
      values: Partial<OrganizationCreateFormData[K]>,
    ) => {
      setData((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...values },
      }));
    },
    [],
  );

  const hydrateDraft = useCallback(
    (nextDraftOrganizationId: string, nextData: OrganizationCreateFormData) => {
      setDraftOrganizationId(nextDraftOrganizationId);
      setData(nextData);
      setResult(null);
    },
    [],
  );

  const reset = useCallback(() => {
    setData(organizationCreateDefaults);
    setResult(null);
    setDraftOrganizationId(null);
  }, []);

  const getStepIndex = useCallback((stepId: OrganizationCreateStepId) => {
    const order: OrganizationCreateStepId[] = ['details', 'commercial', 'review'];
    return order.indexOf(stepId);
  }, []);

  const value = useMemo(
    () => ({
      data,
      result,
      draftOrganizationId,
      updateSection,
      setResult,
      setDraftOrganizationId,
      hydrateDraft,
      reset,
      getStepIndex,
    }),
    [data, result, draftOrganizationId, updateSection, hydrateDraft, reset, getStepIndex],
  );

  return (
    <OrganizationCreateContext.Provider value={value}>
      {children}
    </OrganizationCreateContext.Provider>
  );
}

export function useOrganizationCreate(): OrganizationCreateContextValue {
  const ctx = useContext(OrganizationCreateContext);
  if (!ctx) {
    throw new Error('useOrganizationCreate must be used inside <OrganizationCreateProvider>');
  }
  return ctx;
}

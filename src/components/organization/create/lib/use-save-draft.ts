'use client';

import { useState } from 'react';

import { organizationCreateCopy } from '@/constants/admin/organization-create';
import { useOrganizationCreate } from '@/context/organization-create';
import type { PlatformOrganizationResponseData } from '@/types/organization-create';

export function useSaveOrganizationDraft() {
  const { data, draftOrganizationId, setDraftOrganizationId } = useOrganizationCreate();
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [draftOk, setDraftOk] = useState<boolean | null>(null);
  const [responseData, setResponseData] = useState<PlatformOrganizationResponseData | null>(null);

  async function saveDraft() {
    setSavingDraft(true);
    setDraftMessage(null);
    setDraftOk(null);
    setResponseData(null);

    try {
      const response = await fetch('/api/organizations/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, draftOrganizationId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      setDraftMessage(result.message);
      setDraftOk(result.ok);
      setResponseData(result.data);

      if (result.ok && result.draftOrganizationId) {
        setDraftOrganizationId(result.draftOrganizationId);
      }
    } catch {
      setDraftMessage(organizationCreateCopy.draftSaveError);
      setDraftOk(false);
    } finally {
      setSavingDraft(false);
    }
  }

  return {
    saveDraft,
    savingDraft,
    draftMessage,
    draftOk,
    responseData,
  };
}

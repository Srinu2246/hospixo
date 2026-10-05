import 'server-only';

import {
  organizationCreateCopy,
  mapCreateOrgFallbackResponse,
} from '@/constants/admin/organization-create';
import {
  createOrganizationFromForm,
  loadOrganizationDraftForm as loadDraftForm,
  saveOrganizationDraftRecord,
} from '@/server/dev-organization-store';
import type {
  OrganizationCreateFormData,
  OrganizationCreateResult,
  OrganizationDraftSaveResult,
  PlatformOrganizationResponseData,
} from '@/types/organization-create';

export function loadOrganizationDraftForm(
  organizationId: string,
): OrganizationCreateFormData | null {
  return loadDraftForm(organizationId);
}

export function saveOrganizationDraft(
  data: OrganizationCreateFormData,
  draftOrganizationId?: string | null,
): OrganizationDraftSaveResult {
  const id = saveOrganizationDraftRecord(data, draftOrganizationId);
  return {
    ok: true,
    draftOrganizationId: id,
    message: organizationCreateCopy.draftSaved,
    source: 'local',
    data: mapCreateOrgFallbackResponse(data, id, 'Draft').data as PlatformOrganizationResponseData,
  };
}

export function submitOrganizationCreate(
  data: OrganizationCreateFormData,
  draftOrganizationId?: string | null,
): OrganizationCreateResult {
  return createOrganizationFromForm(data, draftOrganizationId);
}

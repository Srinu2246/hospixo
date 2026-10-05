import { saveOrganizationDraft as saveDraft } from '@/services/organizationCreate.server';
import type {
  OrganizationCreateFormData,
  OrganizationDraftSaveResult,
} from '@/types/organization-create';

export async function saveOrganizationDraft(
  data: OrganizationCreateFormData,
  draftOrganizationId?: string | null,
): Promise<OrganizationDraftSaveResult> {
  return saveDraft(data, draftOrganizationId);
}

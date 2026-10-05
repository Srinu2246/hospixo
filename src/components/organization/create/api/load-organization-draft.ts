import { loadOrganizationDraftForm as loadDraft } from '@/services/organizationCreate.server';
import type { OrganizationCreateFormData } from '@/types/organization-create';

export async function loadOrganizationDraftForm(
  organizationId: string,
): Promise<OrganizationCreateFormData | null> {
  return loadDraft(organizationId);
}

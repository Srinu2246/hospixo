import { OrganizationDraftsList } from '@/components/organization/create/components/organization-drafts-list/organization-drafts-list';
import { getOrganizations } from '@/services/organizations.server';

export default async function OrganizationCreateDraftsPage() {
  const { data } = await getOrganizations({ enrichCounts: false });
  const drafts = data.items.filter((item) => item.status === 'draft');

  return <OrganizationDraftsList drafts={drafts} />;
}

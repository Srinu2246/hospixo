import { notFound } from 'next/navigation';

import { OrganizationDraftResume } from '@/components/organization/create/components/organization-draft-resume/organization-draft-resume';
import { loadOrganizationDraftForm } from '@/services/organizationCreate.server';

export default async function OrganizationCreateDraftPage({
  params,
}: Readonly<{
  params: Promise<{ organizationId: string }>;
}>) {
  const { organizationId } = await params;
  const initialData = loadOrganizationDraftForm(organizationId);

  if (!initialData) {
    notFound();
  }

  return <OrganizationDraftResume draftOrganizationId={organizationId} initialData={initialData} />;
}

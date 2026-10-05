'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  organizationCreateCopy,
  resolveDraftResumePath,
} from '@/constants/admin/organization-create';
import { useOrganizationCreate } from '@/context/organization-create';
import type { OrganizationCreateFormData } from '@/types/organization-create';

type OrganizationDraftResumeProps = Readonly<{
  draftOrganizationId: string;
  initialData: OrganizationCreateFormData;
}>;

export function OrganizationDraftResume({
  draftOrganizationId,
  initialData,
}: OrganizationDraftResumeProps) {
  const router = useRouter();
  const { hydrateDraft } = useOrganizationCreate();

  useEffect(() => {
    hydrateDraft(draftOrganizationId, initialData);
    router.replace(resolveDraftResumePath(initialData));
  }, [draftOrganizationId, hydrateDraft, initialData, router]);

  return <p>{organizationCreateCopy.draftResumeLoading}</p>;
}

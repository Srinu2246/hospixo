import { NextResponse } from 'next/server';

import { getAdminSession } from '@/services/auth.server';
import { saveOrganizationDraft } from '@/services/organizationCreate.server';
import type { OrganizationCreateFormData } from '@/types/organization-create';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const formData = (body?.data ?? body) as OrganizationCreateFormData;
    const draftOrganizationId = body?.draftOrganizationId ?? null;
    const result = saveOrganizationDraft(formData, draftOrganizationId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save draft',
      },
      { status: 400 },
    );
  }
}

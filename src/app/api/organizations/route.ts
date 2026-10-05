import { NextResponse } from 'next/server';

import { getAdminSession } from '@/services/auth.server';
import { submitOrganizationCreate } from '@/services/organizationCreate.server';
import { listOrganizationsForBff } from '@/services/organizations.server';
import type { OrganizationCreateFormData } from '@/types/organization-create';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await listOrganizationsForBff();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as OrganizationCreateFormData & {
      draftOrganizationId?: string;
    };
    const result = submitOrganizationCreate(body, body.draftOrganizationId ?? null);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create organization',
      },
      { status: 400 },
    );
  }
}

import { NextResponse } from 'next/server';

import { getOrganisationDashboard } from '@/features/dashboard/api/organisation-dashboard.server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const { data, source, loadError } = await getOrganisationDashboard(
      Object.fromEntries(searchParams.entries()),
    );

    return NextResponse.json({
      success: true,
      data,
      source,
      loadError: loadError ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load organisation dashboard.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
